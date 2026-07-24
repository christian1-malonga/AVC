from django.urls import path
from .views import (
    MeetingDocumentListCreateView,
    GeneralDocumentListCreateView,
    DocumentDeleteView,
)

urlpatterns = [
    path('meetings/', MeetingDocumentListCreateView.as_view(), name='meeting_documents'),
    path('general/', GeneralDocumentListCreateView.as_view(), name='general_documents'),
    path('<int:pk>/', DocumentDeleteView.as_view(), name='document_delete'),
]
