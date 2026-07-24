from rest_framework import generics, permissions
from .models import Music
from .serializers import MusicSerializer


class MusicListCreateView(generics.ListCreateAPIView):
    queryset = Music.objects.all().order_by('-upload_date')
    serializer_class = MusicSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def perform_create(self, serializer):
        song = serializer.save()
        from notifications.models import broadcast_notification
        broadcast_notification('MUSIC', f'New music added to library: {song.title}')



class MusicDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Music.objects.all()
    serializer_class = MusicSerializer
    permission_classes = [permissions.IsAuthenticated]
