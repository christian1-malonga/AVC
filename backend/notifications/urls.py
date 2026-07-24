from django.urls import path
from .views import NotificationListView, MarkNotificationReadView, CreateAnnouncementView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification_list'),
    path('announcements/', CreateAnnouncementView.as_view(), name='create_announcement'),
    path('<int:pk>/read/', MarkNotificationReadView.as_view(), name='mark_notification_read'),
]

