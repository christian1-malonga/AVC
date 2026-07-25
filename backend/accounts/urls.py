from django.urls import path, re_path
from .views import (
    RegisterView,
    LoginView,
    MeView,
    LogoutView,
    SelectSectionView,
    UserProfileView,
    PendingApprovalsView,
    UserListView,
    ApproveUserView,
    RejectUserView,
    RoleListView,
    UpdateUserRoleView,
    DeleteUserView,
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    re_path(r'register/?$', RegisterView.as_view(), name='register'),
    re_path(r'login/?$', LoginView.as_view(), name='login'),
    re_path(r'token/refresh/?$', TokenRefreshView.as_view(), name='token_refresh'),
    re_path(r'me/?$', MeView.as_view(), name='me'),
    re_path(r'logout/?$', LogoutView.as_view(), name='logout'),
    re_path(r'section/?$', SelectSectionView.as_view(), name='section'),
    re_path(r'profile/?$', UserProfileView.as_view(), name='profile'),
    re_path(r'approvals/pending/?$', PendingApprovalsView.as_view(), name='pending_approvals'),
    re_path(r'approvals/(?P<pk>\d+)/approve/?$', ApproveUserView.as_view(), name='approve_user'),
    re_path(r'approvals/(?P<pk>\d+)/reject/?$', RejectUserView.as_view(), name='reject_user'),
    re_path(r'roles/?$', RoleListView.as_view(), name='role_list'),
    re_path(r'users/?$', UserListView.as_view(), name='user_list'),
    re_path(r'users/(?P<pk>\d+)/role/?$', UpdateUserRoleView.as_view(), name='update_user_role'),
    re_path(r'users/(?P<pk>\d+)/?$', DeleteUserView.as_view(), name='delete_user'),
]