import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'avc_backend.settings')
django.setup()

from accounts.models import User

email = os.getenv('DJANGO_SUPERUSER_EMAIL')
password = os.getenv('DJANGO_SUPERUSER_PASSWORD')

if email and password and not User.objects.filter(email=email).exists():
    User.objects.create_superuser(email=email, password=password, full_name='Admin', phone_number='0000000000')
    print(f'Superuser {email} created.')
else:
    print('Superuser already exists or env vars missing.')
