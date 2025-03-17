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
    # Check if we're in development mode with a mock hash
    if data.get('hash') == 'mock_hash':
        print("Detected mock hash, skipping validation for development/demo mode")
        return True, "Mock data is valid"
    
    if not settings.TELEGRAM_BOT_TOKEN:
        print("No bot token set, skipping validation")
        return True, "No bot token set, skipping validation"
    
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
        # Debug the request
        print("Request Content-Type:", request.META.get('CONTENT_TYPE'))
        print("Request Body Type:", type(request.body))
        
        if len(request.body) > 200:
            print("Request Body (truncated):", request.body[:200], "...")
        else:
            print("Request Body:", request.body)
        
        # Get data from request
        telegram_data = request.data
        print("Parsed Data Type:", type(telegram_data))
        
        if isinstance(telegram_data, dict) and len(telegram_data) > 0:
            print("Parsed Data Keys:", telegram_data.keys())
        else:
            print("Parsed Data:", telegram_data)
        
        # Check if the data is empty
        if not telegram_data:
            print("Empty request data received")
            return Response(
                {"error": "Empty request data. Make sure the request contains valid JSON."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # If data is not a dict, try to convert from string
        if not isinstance(telegram_data, dict):
            try:
                print("Attempting to parse non-dict data")
                import json
                if isinstance(telegram_data, str):
                    telegram_data = json.loads(telegram_data)
                    print("Successfully converted string to JSON")
                else:
                    print(f"Unexpected data type: {type(telegram_data)}")
                    return Response(
                        {"error": f"Unexpected data type: {type(telegram_data)}. Expected JSON object."}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {str(e)}")
                return Response(
                    {"error": f"Invalid JSON format: {str(e)}"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                print(f"Error processing request data: {str(e)}")
                return Response(
                    {"error": f"Error processing request data: {str(e)}"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Validate data
        if 'hash' not in telegram_data:
            print("Hash missing from request data")
            return Response(
                {"error": "Telegram authentication hash is missing"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Skip validation in development if no bot token is set
        if settings.TELEGRAM_BOT_TOKEN:
            is_valid, message = validate_telegram_data(telegram_data)
            if not is_valid:
                print(f"Telegram data validation failed: {message}")
                return Response(
                    {"error": message}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            print("TELEGRAM_BOT_TOKEN not set, skipping validation")
        
        telegram_id = telegram_data.get('id')
        if not telegram_id:
            print("Telegram ID missing from request data")
            return Response(
                {"error": "Telegram ID is missing"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create user
        try:
            telegram_user = TelegramUser.objects.get(telegram_id=telegram_id)
            user = telegram_user.user
            print(f"Existing user found: {user.username}")
            
            # Update user data
            telegram_user.username = telegram_data.get('username')
            telegram_user.first_name = telegram_data.get('first_name', '')
            telegram_user.last_name = telegram_data.get('last_name', '')
            telegram_user.photo_url = telegram_data.get('photo_url')
            telegram_user.auth_date = telegram_data.get('auth_date')
            telegram_user.save()
            print("User data updated")
            
        except TelegramUser.DoesNotExist:
            # Create a new user
            username = telegram_data.get('username') or f"tg_{telegram_id}"
            print(f"Creating new user with username: {username}")
            
            # Make sure username is unique
            if User.objects.filter(username=username).exists():
                username = f"{username}_{telegram_id}"
                print(f"Username already exists, using {username} instead")
            
            user = User.objects.create_user(
                username=username,
                email='',
                password=None  # We don't need a password for Telegram auth
            )
            print(f"User created: {user.id}")
            
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
            print(f"TelegramUser created: {telegram_user.id}")
        
        # Create or get token
        token, created = Token.objects.get_or_create(user=user)
        if created:
            print("New token created")
        else:
            print("Using existing token")
        
        # Return user data and token
        serializer = TelegramUserSerializer(telegram_user)
        response_data = {
            'token': token.key,
            'user': serializer.data
        }
        print("Authentication successful, returning token and user data")
        return Response(response_data)


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
