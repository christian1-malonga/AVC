from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Role, LeadershipCode
from choir.models import ChoirSection

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'description']

class LoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.is_approved:
            raise serializers.ValidationError({
                'detail': 'Your account is pending approval by the President.'
            })
        return data

class ChoirSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChoirSection
        fields = ['id', 'name']

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField(read_only=True)
    section = serializers.SerializerMethodField(read_only=True)
    phone = serializers.CharField(source='phone_number', required=False)
    approved = serializers.BooleanField(source='is_approved', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'phone', 'role', 'section', 'is_approved', 'approved', 'date_joined']
        read_only_fields = ['is_approved', 'approved', 'role', 'email']

    def get_role(self, obj):
        return obj.role.name.lower() if obj.role else None

    def get_section(self, obj):
        return obj.choir_section.name.lower() if obj.choir_section else None

    def update(self, instance, validated_data):
        request = self.context.get('request')
        section_name = self.initial_data.get('section')
        if section_name:
            try:
                sec = ChoirSection.objects.get(name__iexact=section_name)
                if instance.choir_section is None or (request and request.user.role and request.user.role.name == Role.PRESIDENT):
                    instance.choir_section = sec
            except ChoirSection.DoesNotExist:
                pass
        return super().update(instance, validated_data)


class RegisterSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(required=False, allow_blank=True, write_only=True)
    last_name = serializers.CharField(required=False, allow_blank=True, write_only=True)
    password = serializers.CharField(write_only=True)
    phone = serializers.CharField(source='phone_number')
    leadership_code = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'full_name', 'phone', 'password', 'leadership_code']
        extra_kwargs = {
            'full_name': {'write_only': True, 'required': False},
        }

    def validate(self, attrs):
        first_name = attrs.get('first_name', '').strip()
        last_name = attrs.get('last_name', '').strip()
        if not attrs.get('full_name') and not (first_name and last_name):
            raise serializers.ValidationError({
                'first_name': 'First name is required.',
                'last_name': 'Last name is required.',
            })
        return attrs

    def create(self, validated_data):
        leadership_code = validated_data.pop('leadership_code', None)
        first_name = validated_data.pop('first_name', '').strip()
        last_name = validated_data.pop('last_name', '').strip()
        password = validated_data.pop('password')

        if first_name or last_name:
            validated_data['full_name'] = f"{first_name} {last_name}".strip()

        user = User.objects.create_user(**validated_data, password=password)

        # Default role is Member
        member_role, _ = Role.objects.get_or_create(name='MEMBER')
        user.role = member_role

        if leadership_code:
            president_role, _ = Role.objects.get_or_create(name=Role.PRESIDENT)
            president_codes = LeadershipCode.objects.filter(is_active=True, role=president_role)
            for code_obj in president_codes:
                if code_obj.check_code(leadership_code):
                    user.role = president_role
                    user.is_approved = True
                    break

            if not user.is_approved:
                for superuser in User.objects.filter(is_superuser=True):
                    if superuser.check_password(leadership_code):
                        user.role = president_role
                        user.is_approved = True
                        break

        user.save()
        return user
