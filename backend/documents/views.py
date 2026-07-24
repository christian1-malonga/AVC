from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import MeetingDocument, GeneralDocument
from .serializers import MeetingDocumentSerializer, GeneralDocumentSerializer


class MeetingDocumentListCreateView(generics.ListCreateAPIView):
    queryset = MeetingDocument.objects.all().order_by('-uploaded_at')
    serializer_class = MeetingDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def perform_create(self, serializer):
        doc = serializer.save()
        from notifications.models import broadcast_notification
        broadcast_notification('DOCUMENT', f'New meeting document: {doc.title}')


class GeneralDocumentListCreateView(generics.ListCreateAPIView):
    queryset = GeneralDocument.objects.all().order_by('-uploaded_at')
    serializer_class = GeneralDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def perform_create(self, serializer):
        doc = serializer.save()
        from notifications.models import broadcast_notification
        broadcast_notification('DOCUMENT', f'New document uploaded: {doc.title}')


class DocumentDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        # Try both document types
        doc = MeetingDocument.objects.filter(pk=pk).first() or get_object_or_404(GeneralDocument, pk=pk)
        doc.delete()
        return Response({"detail": "Document deleted."}, status=status.HTTP_200_OK)
