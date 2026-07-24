from django.urls import path
from .views import (
    DebtReportUploadView, DebtListView, 
    MyDebtView, DebtReportListView, UpdateDebtView
)

urlpatterns = [
    path('reports/upload/', DebtReportUploadView.as_view(), name='upload_debt_report'),
    path('reports/', DebtReportListView.as_view(), name='debt_report_list'),
    path('list/', DebtListView.as_view(), name='debt_list'),
    path('my/', MyDebtView.as_view(), name='my_debt'),
    path('user/<int:pk>/', UpdateDebtView.as_view(), name='update_user_debt'),
]

