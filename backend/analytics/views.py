import calendar
from datetime import datetime
from django.utils import timezone
from django.db.models import Count, Sum
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.models import User
from debts.models import Debt
from choir.models import ChoirSection
from documents.models import MeetingDocument, GeneralDocument
from music.models import Music
from notifications.models import Notification


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Choir section distribution
        sections = {}
        for s in ChoirSection.objects.all():
            sections[s.name.lower()] = User.objects.filter(is_approved=True, choir_section=s).count()

        # Monthly uploads overview (last 6 months)
        now = timezone.now()
        year = now.year
        month = now.month
        
        uploads_overview = []
        for i in range(5, -1, -1):
            m = month - i
            y = year
            while m <= 0:
                m += 12
                y -= 1
            
            # Start and end date for that month
            start_date = timezone.make_aware(datetime(y, m, 1))
            last_day = calendar.monthrange(y, m)[1]
            end_date = timezone.make_aware(datetime(y, m, last_day, 23, 59, 59, 999999))
            
            docs_count = (
                MeetingDocument.objects.filter(uploaded_at__range=(start_date, end_date)).count() +
                GeneralDocument.objects.filter(uploaded_at__range=(start_date, end_date)).count()
            )
            music_count = Music.objects.filter(upload_date__range=(start_date, end_date)).count()
            
            month_name = calendar.month_abbr[m]
            uploads_overview.append({
                'month': f"{month_name}",
                'documents': docs_count,
                'music': music_count,
                'total': docs_count + music_count
            })

        approved_count = User.objects.filter(is_approved=True).count()
        stats = {
            'member_count': approved_count,
            'pending_approvals': User.objects.filter(is_approved=False).count(),
            'approved_users': approved_count,
            'debt_total': Debt.objects.aggregate(total=Sum('total_debt'))['total'] or 0,
            'document_count': MeetingDocument.objects.count() + GeneralDocument.objects.count(),
            'music_count': Music.objects.count(),
            'notification_count': Notification.objects.filter(user=request.user, is_read=False).count(),
            'section_distribution': sections,
            'uploads_overview': uploads_overview,
        }
        return Response(stats)
