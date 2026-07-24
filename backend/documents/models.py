from django.db import models
from django.conf import settings

class MeetingDocument(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/meetings/')
    date = models.DateField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return self.title

class GeneralDocument(models.Model):
    CATEGORY_CHOICES = [
        ('POLICY', 'Policy'),
        ('SCHEDULE', 'Schedule'),
        ('OTHER', 'Other'),
    ]
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='OTHER')
    file = models.FileField(upload_to='documents/general/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return self.title
