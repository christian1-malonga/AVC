from django.contrib import admin
from .models import ChoirSection


@admin.register(ChoirSection)
class ChoirSectionAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)
