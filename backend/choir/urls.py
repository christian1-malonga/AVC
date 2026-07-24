from django.urls import path
from .views import ChoirSectionListView, SelectChoirSectionView, MyAttendanceView, AttendanceListCreateView

urlpatterns = [
    path('sections/', ChoirSectionListView.as_view(), name='choir_section_list'),
    path('sections/select/', SelectChoirSectionView.as_view(), name='select_choir_section'),
    path('attendance/my/', MyAttendanceView.as_view(), name='my_attendance'),
    path('attendance/', AttendanceListCreateView.as_view(), name='attendance_list_create'),
]

