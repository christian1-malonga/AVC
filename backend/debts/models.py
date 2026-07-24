from django.db import models
from django.conf import settings

class DebtReport(models.Model):
    file = models.FileField(upload_to='debt_reports/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_parsed = models.BooleanField(default=False)

    def __str__(self):
        return f"Report {self.uploaded_at.strftime('%Y-%m-%d %H:%M')}"

class Debt(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='debt_profile')
    total_absence_debt = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_late_debt = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_debt = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Debt for {self.user.full_name}"


class DebtDetail(models.Model):
    debt = models.ForeignKey(Debt, on_delete=models.CASCADE, related_name='details')
    report = models.ForeignKey(DebtReport, on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.CharField(max_length=255) # e.g., "Absence 2024-07-15"
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.reason}: {self.amount}"
