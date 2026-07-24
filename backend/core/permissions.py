from rest_framework import permissions

class IsAuthenticatedAndApproved(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_approved)

class IsApproved(IsAuthenticatedAndApproved):
    def has_permission(self, request, view):
        return super().has_permission(request, view)

class IsPresident(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role and 
            request.user.role.name == 'PRESIDENT'
        )

class IsSecretary(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role and request.user.role.name in ['SECRETARY', 'PRESIDENT'])
        )

class IsCustodian(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role and request.user.role.name in ['CUSTODIAN', 'PRESIDENT'])
        )
