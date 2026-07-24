from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import DebtReport, Debt
from .services import parse_debt_report
from .serializers import DebtReportSerializer, DebtSerializer


class DebtReportUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.data.get('file')
        if not file:
            return Response({'detail': 'File is required.'}, status=status.HTTP_400_BAD_REQUEST)

        report = DebtReport.objects.create(file=file, uploaded_by=request.user)
        unmatched_entries = parse_debt_report(report)
        return Response({'id': report.id, 'unmatched_entries': unmatched_entries}, status=status.HTTP_201_CREATED)


class DebtReportListView(generics.ListAPIView):
    queryset = DebtReport.objects.all().order_by('-uploaded_at')
    serializer_class = DebtReportSerializer
    permission_classes = [permissions.IsAuthenticated]


class DebtListView(generics.ListAPIView):
    queryset = Debt.objects.all().order_by('user__full_name')
    serializer_class = DebtSerializer
    permission_classes = [permissions.IsAuthenticated]


class MyDebtView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        debt = Debt.objects.filter(user=request.user).first()
        if not debt:
            return Response({
                'detail': 'No debt record found.',
                'total_absence_debt': 0,
                'total_late_debt': 0,
                'total_paid': 0,
                'total_debt': 0,
                'details': []
            })
        return Response(DebtSerializer(debt).data)


class UpdateDebtView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        role_name = request.user.role.name.upper() if request.user.role else 'MEMBER'
        if role_name not in ['SECRETARY', 'PRESIDENT']:
            return Response({'detail': 'Only Secretary or President can update debt status.'}, status=status.HTTP_403_FORBIDDEN)

        from accounts.models import User
        from notifications.models import Notification
        try:
            target_user = User.objects.get(pk=pk)
            debt, _ = Debt.objects.get_or_create(user=target_user)
            
            if 'total_absence_debt' in request.data:
                debt.total_absence_debt = request.data['total_absence_debt']
            if 'total_late_debt' in request.data:
                debt.total_late_debt = request.data['total_late_debt']
            if 'total_paid' in request.data:
                debt.total_paid = request.data['total_paid']
            
            # total_debt is total outstanding (absence + late - paid, min 0 or provided)
            calc_debt = max(0, float(debt.total_absence_debt) + float(debt.total_late_debt) - float(debt.total_paid))
            debt.total_debt = request.data.get('total_debt', calc_debt)
            debt.save()

            Notification.objects.create(
                user=target_user,
                type='DEBT',
                message=f'Your debt record was updated by Secretary. Current balance: ₺{debt.total_debt:,.2f}'
            )

            return Response(DebtSerializer(debt).data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

