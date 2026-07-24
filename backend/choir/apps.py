from django.apps import AppConfig


class ChoirConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'choir'

    def ready(self):
        from django.db.models.signals import post_migrate
        from .models import ChoirSection

        def create_default_sections(sender, **kwargs):
            if sender.name != self.name:
                return
            for section_name in [ChoirSection.BASS, ChoirSection.TENOR, ChoirSection.ALTO, ChoirSection.SOPRANO]:
                ChoirSection.objects.get_or_create(name=section_name)

        post_migrate.connect(create_default_sections, sender=self)
