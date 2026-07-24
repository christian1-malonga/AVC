from django.db import models

class SystemSettings(models.Model):
    chatbot_system_prompt = models.TextField(default="You are AVC Bot, the official assistant of Amazing Voices Choir...")
    # Add other settings here as needed
    
    class Meta:
        verbose_name_plural = "System Settings"

    def __str__(self):
        return "System Settings"
