from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import ChoirSection, Attendance
from .serializers import ChoirSectionSerializer, AttendanceSerializer
from core.permissions import IsApproved
from accounts.models import User
from notifications.models import Notification


class ChoirSectionListView(generics.ListAPIView):
    queryset = ChoirSection.objects.all()
    serializer_class = ChoirSectionSerializer
    permission_classes = [permissions.IsAuthenticated, IsApproved]


class SelectChoirSectionView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsApproved]

    def post(self, request):
        choir_section_id = request.data.get('choir_section')
        if not choir_section_id:
            return Response({'detail': 'Choir section is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if request.user.choir_section and not (request.user.role and request.user.role.name == 'PRESIDENT'):
            return Response({'detail': 'Choir section can only be updated by the President after initial selection.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            section = ChoirSection.objects.get(pk=choir_section_id)
            request.user.choir_section = section
            request.user.save()
            return Response({'detail': 'Choir section selected successfully.'}, status=status.HTTP_200_OK)
        except ChoirSection.DoesNotExist:
            return Response({'detail': 'Choir section not found.'}, status=status.HTTP_404_NOT_FOUND)


class MyAttendanceView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsApproved]

    def get(self, request):
        attendances = Attendance.objects.filter(user=request.user).order_by('-date')
        present_count = attendances.filter(status=Attendance.PRESENT).count()
        absent_count = attendances.filter(status=Attendance.ABSENT).count()
        total_sessions = present_count + absent_count
        percentage = round((present_count / total_sessions * 100)) if total_sessions > 0 else 100

        return Response({
            'present_count': present_count,
            'absent_count': absent_count,
            'total_sessions': total_sessions,
            'percentage': percentage,
            'history': AttendanceSerializer(attendances, many=True).data,
        })


class AttendanceListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsApproved]

    def get(self, request):
        attendances = Attendance.objects.all().order_by('-date')
        return Response(AttendanceSerializer(attendances, many=True).data)

    def post(self, request):
        # Allow single or bulk marking
        # Body format: { "date": "2026-07-24", "records": [{ "user_id": 1, "status": "PRESENT" }] }
        date_str = request.data.get('date', timezone.now().date().isoformat())
        records = request.data.get('records', [])

        if not records and request.data.get('user'):
            records = [{'user_id': request.data.get('user'), 'status': request.data.get('status', 'PRESENT')}]

        created_count = 0
        for rec in records:
            user_id = rec.get('user_id') or rec.get('user')
            status_val = rec.get('status', 'PRESENT')
            if not user_id:
                continue
            try:
                target_user = User.objects.get(pk=user_id)
                att, _ = Attendance.objects.update_or_create(
                    user=target_user,
                    date=date_str,
                    defaults={'status': status_val, 'marked_by': request.user}
                )
                created_count += 1
                Notification.objects.create(
                    user=target_user,
                    type='ANNOUNCEMENT',
                    message=f'Attendance recorded for {date_str}: {status_val.capitalize()}'
                )
            except User.DoesNotExist:
                continue

        return Response({'detail': f'Attendance marked for {created_count} members.'}, status=status.HTTP_200_OK)

