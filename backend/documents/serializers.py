from rest_framework import serializers
from .models import MeetingDocument, GeneralDocument


class MeetingDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)

    class Meta:
        model = MeetingDocument
        fields = ['id', 'title', 'file', 'date', 'uploaded_at', 'uploaded_by_name']


class GeneralDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)

    class Meta:
        model = GeneralDocument
        fields = ['id', 'title', 'category', 'file', 'uploaded_at', 'uploaded_by_name']
