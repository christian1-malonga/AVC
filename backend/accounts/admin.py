from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import User, Role, LeadershipCode


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)


@admin.register(LeadershipCode)
class LeadershipCodeAdmin(admin.ModelAdmin):
    list_display = ('role', 'is_active', 'created_at')
    list_filter = ('role', 'is_active')
    search_fields = ('role__name',)

    def save_model(self, request, obj, form, change):
        if obj.code and not obj.code.startswith('pbkdf2_'):
            obj.set_code(obj.code)
        super().save_model(request, obj, form, change)


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    model = User
    list_display = ('email', 'full_name', 'phone_number', 'role', 'is_approved', 'is_staff')
    list_filter = ('is_approved', 'is_staff', 'role')
    search_fields = ('email', 'full_name', 'phone_number')
    ordering = ('email',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('full_name', 'phone_number', 'role', 'choir_section')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_approved', 'groups', 'user_permissions')}),
    )
    readonly_fields = ('last_login', 'date_joined')

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'phone_number', 'password1', 'password2', 'is_approved', 'is_staff'),
        }),
    )
