from rest_framework import permissions, generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Notification, broadcast_notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')


class MarkNotificationReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({'detail': 'Notification marked read.'})
        except Notification.DoesNotExist:
            return Response({'detail': 'Notification not found.'}, status=status.HTTP_404_NOT_FOUND)


class CreateAnnouncementView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        role_name = request.user.role.name.upper() if request.user.role else 'MEMBER'
        if role_name not in ['PRESIDENT', 'SECRETARY']:
            return Response({'detail': 'Only President or Secretary can post announcements.'}, status=status.HTTP_403_FORBIDDEN)

        message = request.data.get('message', '').strip()
        if not message:
            return Response({'detail': 'Announcement message is required.'}, status=status.HTTP_400_BAD_REQUEST)

        broadcast_notification('ANNOUNCEMENT', message)
        return Response({'detail': 'Announcement broadcast successfully.'}, status=status.HTTP_201_CREATED)

