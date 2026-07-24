from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        from django.db.models.signals import post_migrate
        from .models import Role

        def create_default_roles(sender, **kwargs):
            if sender.name != self.name:
                return
            for role_name in [Role.MEMBER, Role.PRESIDENT, Role.SECRETARY, Role.CUSTODIAN]:
                Role.objects.get_or_create(name=role_name)

        post_migrate.connect(create_default_roles, sender=self)
