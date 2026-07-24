from rest_framework import serializers
from .models import ChoirSection, Attendance



class ChoirSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChoirSection
        fields = ['id', 'name']


class AttendanceSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.full_name')
    user_email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = Attendance
        fields = ['id', 'user', 'user_name', 'user_email', 'date', 'status', 'marked_by', 'created_at']
        read_only_fields = ['id', 'marked_by', 'created_at']

