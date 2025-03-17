# Backend Code Flow Explanation

This document explains the backend implementation of our Telegram Mini App, detailing the flow of data from the moment a request hits the server to when a response is sent back. We'll explore both the authentication system and the game logic.

## Table of Contents
- [Backend Code Flow Explanation](#backend-code-flow-explanation)
  - [Table of Contents](#table-of-contents)
  - [1. Telegram Authentication Flow](#1-telegram-authentication-flow)
    - [URL Routing (telegram_auth/urls.py)](#url-routing-telegram_authurlspy)
    - [Authentication View (telegram_auth/views.py)](#authentication-view-telegram_authviewspy)
    - [Data Validation Process](#data-validation-process)
    - [User Creation or Update](#user-creation-or-update)
    - [Token Generation](#token-generation)
    - [Response Construction](#response-construction)
    - [User Model Structure (telegram_auth/models.py)](#user-model-structure-telegram_authmodelspy)
    - [User Serialization (telegram_auth/serializers.py)](#user-serialization-telegram_authserializerspy)
  - [2. Game Logic Flow](#2-game-logic-flow)
    - [URL Routing (game/urls.py)](#url-routing-gameurlspy)
    - [Game Play Views (game/views.py)](#game-play-views-gameviewspy)
    - [Game Statistics Views](#game-statistics-views)
    - [Game Models (game/models.py)](#game-models-gamemodelspy)
    - [Game Serializers (game/serializers.py)](#game-serializers-gameserializerspy)

## 1. Telegram Authentication Flow

The authentication flow is crucial for identifying and verifying Telegram users in our Mini App.

### URL Routing (telegram_auth/urls.py)

When a request comes in, Django's URL dispatcher examines `urls.py` to determine which view should handle it:

```python
from django.urls import path
from .views import TelegramAuthView, UserProfileView

urlpatterns = [
    path('telegram/', TelegramAuthView.as_view(), name='telegram-auth'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
]
```

This configuration means:
1. Requests to `/api/auth/telegram/` are routed to the `TelegramAuthView`
2. Requests to `/api/auth/profile/` are routed to the `UserProfileView`

### Authentication View (telegram_auth/views.py)

The authentication view processes the Telegram data and authenticates the user:

```python
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
        
        # Get or create user logic...
```

When a POST request arrives at this view:
1. The request data is extracted, which should contain Telegram's authentication data
2. The data is validated to check if required fields are present
3. The data hash is verified using Telegram's validation process (unless in development mode)
4. The Telegram ID is extracted to identify the user

### Data Validation Process

Telegram data validation is a critical security step:

```python
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
```

This validation process follows Telegram's official protocol:
1. It checks if the auth_date is recent (within 24 hours)
2. It creates a data check string by sorting all fields (except the hash) and joining them
3. It creates a secret key by hashing the bot token
4. It computes a hash of the data check string using the secret key
5. It compares the computed hash with the provided hash to verify authenticity

### User Creation or Update

After validating the data, the system either creates a new user or updates an existing one:

```python
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
```

This code:
1. First, tries to find an existing TelegramUser with the provided telegram_id
   - If found, it updates the user's data with the latest information from Telegram
   - This keeps the user's data in sync with their Telegram profile
2. If no user exists:
   - Creates a new Django User with a unique username
   - Creates a TelegramUser linked to this Django User
   - Stores all relevant Telegram data

The entire process is wrapped in a `@transaction.atomic` decorator, ensuring that all database operations occur in a single transaction - either all succeed or all fail.

### Token Generation

After user creation/update, an authentication token is generated:

```python
# Create or get token
token, created = Token.objects.get_or_create(user=user)
```

This line:
1. Retrieves an existing token for the user if one exists
2. Creates a new token if the user doesn't have one yet
3. Returns both the token and a boolean indicating if it was newly created

### Response Construction

Finally, the user data and token are returned to the client:

```python
# Return user data and token
serializer = TelegramUserSerializer(telegram_user)
return Response({
    'token': token.key,
    'user': serializer.data
})
```

This response:
1. Contains the authentication token for future requests
2. Includes the serialized user data with all relevant user information
3. Is sent with a 200 OK status code

### User Model Structure (telegram_auth/models.py)

The TelegramUser model stores Telegram-specific user information:

```python
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
```

This model:
1. Extends Django's built-in User model using a OneToOneField relationship
2. Stores the Telegram ID (unique identifier for the Telegram user)
3. Stores additional Telegram-specific information like username, name, photo URL
4. Stores the authentication timestamp for verifying token freshness

### User Serialization (telegram_auth/serializers.py)

The serializer converts TelegramUser objects to JSON and back:

```python
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
```

These serializers:
1. Define how to convert User and TelegramUser models to and from JSON
2. Specify which fields should be included in the serialized data
3. Mark certain fields as read-only to prevent modification

## 2. Game Logic Flow

The game logic handles game actions and statistics tracking.

### URL Routing (game/urls.py)

Game-related URLs are defined as follows:

```python
from django.urls import path
from .views import GameView, GameStatsView

urlpatterns = [
    path('play/', GameView.as_view(), name='play-game'),
    path('history/', GameView.as_view(), name='game-history'),
    path('stats/', GameStatsView.as_view(), name='game-stats'),
]
```

This routing means:
1. Requests to `/api/game/play/` are routed to the GameView
2. Requests to `/api/game/history/` are also routed to the GameView (but GET method)
3. Requests to `/api/game/stats/` are routed to the GameStatsView

### Game Play Views (game/views.py)

The GameView handles playing a game and retrieving game history:

```python
class GameView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user's game history"""
        games = Game.objects.filter(user=request.user).order_by('-created_at')
        serializer = GameSerializer(games, many=True)
        return Response(serializer.data)
    
    @transaction.atomic
    def post(self, request):
        """Play a game of rock-paper-scissors"""
        data = request.data.copy()
        data['user'] = request.user.id
        
        serializer = GameSerializer(data=data)
        if serializer.is_valid():
            # Create a game instance but don't save yet
            game = serializer.save()
            
            # Generate computer's choice
            choices = [choice[0] for choice in Game.CHOICES]
            game.computer_choice = random.choice(choices)
            
            # Calculate result
            result = game.calculate_result()
            
            # Update or create game stats
            stats, created = GameStats.objects.get_or_create(user=request.user)
            stats.update_stats(result)
            
            # Return game data
            return Response(GameSerializer(game).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

When a POST request to play a game arrives:
1. The request is first authenticated (IsAuthenticated permission)
2. The user's ID is added to the request data
3. The data is validated using the GameSerializer
4. A new Game instance is created (but not yet fully saved)
5. The computer's choice is randomly generated
6. The game result is calculated using the model's `calculate_result()` method
7. User statistics are updated to reflect this game's outcome
8. The completed game data is returned to the client

The GET method simply returns the user's game history, ordered by creation date.

### Game Statistics Views

The GameStatsView returns the user's game statistics:

```python
class GameStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user's game statistics"""
        stats, created = GameStats.objects.get_or_create(user=request.user)
        serializer = GameStatsSerializer(stats)
        return Response(serializer.data)
```

This view:
1. Retrieves the authenticated user's game statistics
2. Creates a new GameStats record if one doesn't exist
3. Serializes the statistics and returns them to the client

### Game Models (game/models.py)

The Game model represents a single game instance:

```python
class Game(models.Model):
    CHOICES = (
        ('rock', 'Rock'),
        ('paper', 'Paper'),
        ('scissors', 'Scissors'),
    )
    
    STATUSES = (
        ('active', 'Active'),
        ('completed', 'Completed'),
    )
    
    RESULTS = (
        ('win', 'Win'),
        ('lose', 'Lose'),
        ('draw', 'Draw'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='games')
    user_choice = models.CharField(max_length=10, choices=CHOICES)
    computer_choice = models.CharField(max_length=10, choices=CHOICES)
    result = models.CharField(max_length=10, choices=RESULTS, null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUSES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def calculate_result(self):
        if self.user_choice == self.computer_choice:
            self.result = 'draw'
        elif (
            (self.user_choice == 'rock' and self.computer_choice == 'scissors') or
            (self.user_choice == 'paper' and self.computer_choice == 'rock') or
            (self.user_choice == 'scissors' and self.computer_choice == 'paper')
        ):
            self.result = 'win'
        else:
            self.result = 'lose'
        
        self.status = 'completed'
        self.save()
        
        return self.result
```

The GameStats model tracks user statistics:

```python
class GameStats(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='game_stats')
    total_games = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    draws = models.IntegerField(default=0)
    
    def update_stats(self, result):
        self.total_games += 1
        
        if result == 'win':
            self.wins += 1
        elif result == 'lose':
            self.losses += 1
        elif result == 'draw':
            self.draws += 1
            
        self.save()
```

These models:
1. Define the structure for storing game data and user statistics
2. Include game logic like calculating the winner based on player and computer choices
3. Provide methods for updating statistics based on game results

### Game Serializers (game/serializers.py)

The serializers convert game data to and from JSON:

```python
class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'user', 'user_choice', 'computer_choice', 
                  'result', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'computer_choice', 'result', 
                           'status', 'created_at', 'updated_at']

    def validate_user_choice(self, value):
        valid_choices = [choice[0] for choice in Game.CHOICES]
        if value not in valid_choices:
            raise serializers.ValidationError(
                f"Invalid choice. Must be one of: {', '.join(valid_choices)}"
            )
        return value


class GameStatsSerializer(serializers.ModelSerializer):
    win_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = GameStats
        fields = ['id', 'user', 'total_games', 'wins', 
                  'losses', 'draws', 'win_percentage']
        read_only_fields = ['id', 'user', 'total_games', 'wins', 
                           'losses', 'draws', 'win_percentage']
    
    def get_win_percentage(self, obj):
        if obj.total_games > 0:
            return round((obj.wins / obj.total_games) * 100, 2)
        return 0.0
```

These serializers:
1. Define how to convert Game and GameStats models to and from JSON
2. Specify which fields should be included in the serialized data
3. Add custom validation for user choices
4. Include calculated fields like win_percentage that aren't directly stored in the database 