from django.urls import path
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
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('section/', SelectSectionView.as_view(), name='section'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('approvals/pending/', PendingApprovalsView.as_view(), name='pending_approvals'),
    path('approvals/<int:pk>/approve/', ApproveUserView.as_view(), name='approve_user'),
    path('approvals/<int:pk>/reject/', RejectUserView.as_view(), name='reject_user'),
    path('roles/', RoleListView.as_view(), name='role_list'),
    path('users/', UserListView.as_view(), name='user_list'),
    path('users/<int:pk>/role/', UpdateUserRoleView.as_view(), name='update_user_role'),
    path('users/<int:pk>/', DeleteUserView.as_view(), name='delete_user'),
]
