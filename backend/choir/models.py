from django.db import models

class ChoirSection(models.Model):
    BASS = 'BASS'
    TENOR = 'TENOR'
    ALTO = 'ALTO'
    SOPRANO = 'SOPRANO'
    
    SECTION_CHOICES = [
        (BASS, 'Bass'),
        (TENOR, 'Tenor'),
        (ALTO, 'Alto'),
        (SOPRANO, 'Soprano'),
    ]
    
    name = models.CharField(max_length=10, choices=SECTION_CHOICES, unique=True)

    def __str__(self):
        return self.get_name_display()

class Attendance(models.Model):
    PRESENT = 'PRESENT'
    ABSENT = 'ABSENT'

    STATUS_CHOICES = [
        (PRESENT, 'Present'),
        (ABSENT, 'Absent'),
    ]

    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=PRESENT)
    marked_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='marked_attendances')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.full_name} - {self.date} ({self.status})"

