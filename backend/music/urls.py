from django.urls import path
from .views import MusicListCreateView, MusicDetailView

urlpatterns = [
    path('', MusicListCreateView.as_view(), name='music_list'),
    path('<int:pk>/', MusicDetailView.as_view(), name='music_detail'),
]
