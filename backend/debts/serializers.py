from rest_framework import serializers
from .models import DebtReport, Debt, DebtDetail


class DebtDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = DebtDetail
        fields = ['id', 'amount', 'reason', 'date', 'created_at']


class DebtSerializer(serializers.ModelSerializer):
    details = DebtDetailSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = Debt
        fields = ['id', 'user', 'user_name', 'total_absence_debt', 'total_late_debt', 'total_paid', 'total_debt', 'updated_at', 'details']



class DebtReportSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)

    class Meta:
        model = DebtReport
        fields = ['id', 'file', 'uploaded_at', 'uploaded_by_name', 'is_parsed']
