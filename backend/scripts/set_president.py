import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE','avc_backend.settings')
django.setup()
from accounts.models import User, Role
u = User.objects.filter(is_superuser=True).first()
if not u:
    print('No superuser found')
else:
    print('found superuser:', u.email)
    r, _ = Role.objects.get_or_create(name=Role.PRESIDENT)
    u.role = r
    u.is_approved = True
    u.is_staff = True
    u.save()
    print('updated:', u.email, u.role.name, u.is_approved)
