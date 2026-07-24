from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, Role, LeadershipCode
from .serializers import RegisterSerializer, UserSerializer, RoleSerializer, LoginSerializer
from core.permissions import IsPresident, IsApproved
from choir.models import ChoirSection

class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.user
        data = serializer.validated_data
        return Response(
            {
                'token': data.get('access'),
                'refresh': data.get('refresh'),
                'user': UserSerializer(user, context={'request': request}).data,
            },
            status=status.HTTP_200_OK,
        )

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsApproved]

    def get(self, request):
        return Response(UserSerializer(request.user, context={'request': request}).data)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsApproved]

    def post(self, request):
        return Response(status=status.HTTP_204_NO_CONTENT)

class SelectSectionView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsApproved]

    def post(self, request):
        choir_section_name = request.data.get('section')
        if not choir_section_name:
            return Response({'detail': 'Choir section is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if request.user.choir_section and not (request.user.role and request.user.role.name == Role.PRESIDENT):
            return Response(
                {'detail': 'Choir section can only be updated by the President after initial selection.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            section = ChoirSection.objects.get(name__iexact=choir_section_name)
        except ChoirSection.DoesNotExist:
            return Response({'detail': 'Choir section not found.'}, status=status.HTTP_404_NOT_FOUND)

        request.user.choir_section = section
        request.user.save()
        return Response({'detail': 'Choir section selected successfully.', 'section': section.name})

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsApproved]

    def get_object(self):
        return self.request.user

class PendingApprovalsView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsPresident]
    pagination_class = None

    def get_queryset(self):
        return User.objects.filter(is_approved=False)

class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsPresident]
    pagination_class = None

    def get_queryset(self):
        return User.objects.all().order_by('full_name')

class ApproveUserView(APIView):
    permission_classes = [IsPresident]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            user.is_approved = True
            user.save()
            # In a real app, send notification here
            return Response({"detail": f"User {user.email} approved."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

class RejectUserView(APIView):
    permission_classes = [IsPresident]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            user.delete()
            return Response({"detail": "User rejected and deleted."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

class RoleListView(generics.ListAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsPresident]
    pagination_class = None

class UpdateUserRoleView(APIView):
    permission_classes = [IsPresident]

    def post(self, request, pk):
        role_id = request.data.get('role_id')
        try:
            user = User.objects.get(pk=pk)
            role = Role.objects.get(pk=role_id)
            user.role = role
            user.save()
            return Response({"detail": "User role updated."}, status=status.HTTP_200_OK)
        except (User.DoesNotExist, Role.DoesNotExist):
            return Response({"detail": "User or Role not found."}, status=status.HTTP_404_NOT_FOUND)


class DeleteUserView(APIView):
    permission_classes = [IsPresident]

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            if user == request.user:
                return Response({"detail": "Cannot delete yourself."}, status=status.HTTP_400_BAD_REQUEST)
            user.delete()
            return Response({"detail": "User deleted."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
