from django.db import models
from django.conf import settings

class Notification(models.Model):
    TYPE_CHOICES = [
        ('APPROVAL', 'Approval'),
        ('DOCUMENT', 'New Document'),
        ('DEBT', 'New Debt'),
        ('MUSIC', 'New Music'),
        ('ANNOUNCEMENT', 'Announcement'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} - {self.user.email}"


def broadcast_notification(ntype, message):
    from accounts.models import User
    users = User.objects.filter(is_approved=True)
    objs = [Notification(user=u, type=ntype, message=message) for u in users]
    Notification.objects.bulk_create(objs)

