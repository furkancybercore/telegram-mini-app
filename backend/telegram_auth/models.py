from django.db import models
from django.contrib.auth.models import User

class TelegramUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='telegram_user')
    telegram_id = models.BigIntegerField(unique=True)
    username = models.CharField(max_length=255, blank=True, null=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255, blank=True, null=True)
    photo_url = models.URLField(blank=True, null=True)
    auth_date = models.IntegerField()  # Timestamp of authentication
    
    def __str__(self):
        return f"{self.first_name} {self.last_name or ''} (@{self.username or 'no username'})"
