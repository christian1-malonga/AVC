from django.db import models
from django.contrib.auth.hashers import make_password, check_password, is_password_usable
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from choir.models import ChoirSection

class Role(models.Model):
    MEMBER = 'MEMBER'
    PRESIDENT = 'PRESIDENT'
    SECRETARY = 'SECRETARY'
    CUSTODIAN = 'CUSTODIAN'
    
    ROLE_CHOICES = [
        (MEMBER, 'Member'),
        (PRESIDENT, 'President'),
        (SECRETARY, 'Secretary'),
        (CUSTODIAN, 'Custodian'),
    ]
    
    name = models.CharField(max_length=20, choices=ROLE_CHOICES, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.get_name_display()

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_approved', True)

        user = self.create_user(email, password, **extra_fields)
        president_role, _ = Role.objects.get_or_create(name=Role.PRESIDENT)
        user.role = president_role
        user.save(using=self._db)
        return user

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)
    choir_section = models.ForeignKey(ChoirSection, on_delete=models.SET_NULL, null=True, blank=True)
    
    is_approved = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    date_joined = models.DateTimeField(auto_now_add=True)
    
    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name', 'phone_number']

    def __str__(self):
        return self.email

class LeadershipCode(models.Model):
    code = models.CharField(max_length=255, unique=True)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def set_code(self, raw_code):
        self.code = make_password(raw_code)

    def check_code(self, raw_code):
        return check_password(raw_code, self.code)

    def save(self, *args, **kwargs):
        if self.code and not is_password_usable(self.code):
            self.code = make_password(self.code)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.role.name} Code - {self.code[:5]}..."
