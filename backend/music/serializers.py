from rest_framework import serializers
from .models import Music


class MusicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Music
        fields = ['id', 'title', 'composer', 'category', 'pdf_file', 'docx_file', 'audio_file', 'upload_date']
