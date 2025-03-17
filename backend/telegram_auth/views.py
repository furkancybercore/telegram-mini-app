from django.shortcuts import render
import hmac
import hashlib
import time
from django.conf import settings
from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token

from .models import TelegramUser
from .serializers import TelegramUserSerializer

def validate_telegram_data(data):
    """
    Validate data received from Telegram Mini App
    """
    if not settings.TELEGRAM_BOT_TOKEN:
        return False, "Telegram Bot Token is not set"
    
    # Check if auth_date is fresh (not older than 24 hours)
    if int(time.time()) - int(data.get('auth_date', 0)) > 86400:
        return False, "Authentication data is outdated"

    # Create data check string
    sorted_data = sorted([(k, v) for k, v in data.items() if k != 'hash'])
    data_check_string = '\n'.join([f"{k}={v}" for k, v in sorted_data])
    
    # Create secret key from bot token
    secret_key = hashlib.sha256(settings.TELEGRAM_BOT_TOKEN.encode()).digest()
    
    # Compute hash
    computed_hash = hmac.new(
        secret_key,
        data_check_string.encode(),
        hashlib.sha256
    ).hexdigest()
    
    # Compare hash
    if computed_hash != data.get('hash'):
        return False, "Data hash is invalid"
    
    return True, "Data is valid"

class TelegramAuthView(APIView):
    permission_classes = [permissions.AllowAny]
    
    @transaction.atomic
    def post(self, request):
        """
        Authenticate a user via Telegram data
        """
        # Get data from request
        telegram_data = request.data
        
        # Validate data
        if 'hash' not in telegram_data:
            return Response(
                {"error": "Telegram authentication hash is missing"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Skip validation in development if no bot token is set
        if settings.TELEGRAM_BOT_TOKEN:
            is_valid, message = validate_telegram_data(telegram_data)
            if not is_valid:
                return Response(
                    {"error": message}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        telegram_id = telegram_data.get('id')
        if not telegram_id:
            return Response(
                {"error": "Telegram ID is missing"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create user
        try:
            telegram_user = TelegramUser.objects.get(telegram_id=telegram_id)
            user = telegram_user.user
            
            # Update user data
            telegram_user.username = telegram_data.get('username')
            telegram_user.first_name = telegram_data.get('first_name', '')
            telegram_user.last_name = telegram_data.get('last_name', '')
            telegram_user.photo_url = telegram_data.get('photo_url')
            telegram_user.auth_date = telegram_data.get('auth_date')
            telegram_user.save()
            
        except TelegramUser.DoesNotExist:
            # Create a new user
            username = telegram_data.get('username') or f"tg_{telegram_id}"
            
            # Make sure username is unique
            if User.objects.filter(username=username).exists():
                username = f"{username}_{telegram_id}"
            
            user = User.objects.create_user(
                username=username,
                email='',
                password=None  # We don't need a password for Telegram auth
            )
            
            # Create TelegramUser
            telegram_user = TelegramUser.objects.create(
                user=user,
                telegram_id=telegram_id,
                username=telegram_data.get('username'),
                first_name=telegram_data.get('first_name', ''),
                last_name=telegram_data.get('last_name', ''),
                photo_url=telegram_data.get('photo_url'),
                auth_date=telegram_data.get('auth_date')
            )
        
        # Create or get token
        token, created = Token.objects.get_or_create(user=user)
        
        # Return user data and token
        serializer = TelegramUserSerializer(telegram_user)
        return Response({
            'token': token.key,
            'user': serializer.data
        })


class UserProfileView(APIView):
    def get(self, request):
        """Get user's profile data"""
        try:
            telegram_user = request.user.telegram_user
            serializer = TelegramUserSerializer(telegram_user)
            return Response(serializer.data)
        except TelegramUser.DoesNotExist:
            return Response(
                {"error": "User profile not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def put(self, request):
        """Update user's profile data"""
        try:
            telegram_user = request.user.telegram_user
            serializer = TelegramUserSerializer(
                telegram_user, 
                data=request.data,
                partial=True
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            
            return Response(
                serializer.errors, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except TelegramUser.DoesNotExist:
            return Response(
                {"error": "User profile not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
