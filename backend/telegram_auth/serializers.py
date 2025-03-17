from rest_framework import serializers
from django.contrib.auth.models import User
from .models import TelegramUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']
        read_only_fields = ['id', 'username']

class TelegramUserSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = TelegramUser
        fields = ['id', 'user', 'telegram_id', 'username', 'first_name', 
                  'last_name', 'photo_url', 'auth_date']
        read_only_fields = ['id', 'user', 'telegram_id', 'auth_date'] 