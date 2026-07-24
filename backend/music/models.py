from django.db import models

class Music(models.Model):
    CATEGORY_CHOICES = [
        ('HYMN', 'Hymn'),
        ('ANTHEM', 'Anthem'),
        ('CONTEMPORARY', 'Contemporary'),
        ('CLASSICAL', 'Classical'),
        ('OTHER', 'Other'),
    ]
    title = models.CharField(max_length=255)
    composer = models.CharField(max_length=255, blank=True, null=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='OTHER')
    pdf_file = models.FileField(upload_to='music/pdf/', blank=True, null=True)
    docx_file = models.FileField(upload_to='music/docx/', blank=True, null=True)
    audio_file = models.FileField(upload_to='music/audio/', blank=True, null=True)
    upload_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name_plural = "Music Library"
