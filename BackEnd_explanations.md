# Backend Code Flow Explanation

This document explains the simplified backend implementation of our Telegram Mini App, focusing on the core functionality for educational purposes.

## Table of Contents
- [Backend Code Flow Explanation](#backend-code-flow-explanation)
  - [Table of Contents](#table-of-contents)
  - [1. Telegram Authentication Flow](#1-telegram-authentication-flow)
    - [URL Routing](#url-routing)
    - [Authentication Function](#authentication-function)
    - [Data Validation](#data-validation)
    - [User Creation or Update](#user-creation-or-update)
    - [Token Generation](#token-generation)
    - [Response Construction](#response-construction)
    - [User Model Structure](#user-model-structure)
  - [2. Game Logic Flow](#2-game-logic-flow)
    - [URL Routing](#url-routing-1)
    - [Game Play Function](#game-play-function)
    - [Game History Function](#game-history-function)
    - [Game Statistics Function](#game-statistics-function)
    - [Game Models](#game-models)

## 1. Telegram Authentication Flow

### URL Routing

When a request comes in, Django's URL dispatcher routes it to the appropriate function:

```python
from django.urls import path
from . import views

urlpatterns = [
    path('telegram/', views.telegram_auth, name='telegram-auth'),
    path('profile/', views.get_user_profile, name='user-profile-get'),
    path('profile/update/', views.update_user_profile, name='user-profile-update'),
]
```

### Authentication Function

The `telegram_auth` function handles Telegram authentication:

```python
@api_view(["POST"])
def telegram_auth(request):
    """Authenticate a user via Telegram data and return user details with token."""
    # Get data from request
    telegram_data = request.data
    
    # Validate data
    if 'hash' not in telegram_data:
        return Response(
            {"error": "Telegram authentication hash is missing"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate hash if bot token is set
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
        
    # Get or create user...
    # Create or get token...
    # Return response...
```

This function:
1. Gets the data from the request
2. Validates that it contains a hash
3. Verifies the hash to ensure the data came from Telegram
4. Gets or creates a user based on the Telegram ID
5. Creates an authentication token
6. Returns the user data and token

### Data Validation

Telegram data validation ensures the data came from Telegram:

```python
def validate_telegram_data(data):
    # For development mode with a mock hash
    if data.get('hash') == 'mock_hash':
        return True, "Mock data is valid"
    
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

### Token Generation

After user creation/update, an authentication token is generated:

```python
# Create or get token
token, created = Token.objects.get_or_create(user=user)
```

This line either retrieves an existing token for the user or creates a new one.

### Response Construction

Finally, the user data and token are returned to the client:

```python
# Return user data and token
serializer = TelegramUserSerializer(telegram_user)
response_data = {
    'token': token.key,
    'user': serializer.data
}
return Response(response_data)
```

Example response:
```json
{
    "token": "9c5f1bb7a8c5f1bb7a8c5f1bb7a8c5f1bb7a8c5f",
    "user": {
        "id": 1,
        "user": {
            "id": 1,
            "username": "johndoe",
            "email": ""
        },
        "telegram_id": 123456789,
        "username": "johndoe",
        "first_name": "John",
        "last_name": "Doe",
        "photo_url": "https://t.me/i/userpic/320/johndoe.jpg",
        "auth_date": 1617346200
    }
}
```

### User Model Structure

The TelegramUser model stores Telegram-specific user information:

```python
class TelegramUser(models.Model):
    # One-to-one relationship with Django's built-in User model
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='telegram_user'
    )
    
    # Telegram-specific fields
    telegram_id = models.BigIntegerField(unique=True)
    username = models.CharField(max_length=255, blank=True, null=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255, blank=True, null=True)
    photo_url = models.URLField(blank=True, null=True)
    auth_date = models.IntegerField()
```

## 2. Game Logic Flow

### URL Routing

Game-related URLs are defined as follows:

```python
from django.urls import path
from . import views

urlpatterns = [
    path('play/', views.play_game, name='play-game'),
    path('history/', views.get_game_history, name='game-history'),
    path('stats/', views.get_game_stats, name='game-stats'),
]
```

### Game Play Function

The `play_game` function handles playing a game of rock-paper-scissors:

```python
@api_view(["POST"])
def play_game(request):
    """Play a game of rock-paper-scissors."""
    data = request.data.copy()
    data['user'] = request.user.id
    
    serializer = GameSerializer(data=data)
    if serializer.is_valid():
        # Create a game instance
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

Game play process:
1. The user's choice is validated
2. A new game instance is created
3. The computer's choice is randomly generated
4. The game result is calculated based on the choices
5. The user's statistics are updated
6. The game data is returned to the client

### Game History Function

The `get_game_history` function returns the user's game history:

```python
@api_view(["GET"])
def get_game_history(request):
    """Get user's game history."""
    games = Game.objects.filter(user=request.user).order_by('-created_at')
    serializer = GameSerializer(games, many=True)
    return Response(serializer.data)
```

### Game Statistics Function

The `get_game_stats` function returns the user's game statistics:

```python
@api_view(["GET"])
def get_game_stats(request):
    """Get user's game statistics."""
    stats, created = GameStats.objects.get_or_create(user=request.user)
    serializer = GameStatsSerializer(stats)
    return Response(serializer.data)
```

### Game Models

The Game model represents a single game instance:

```python
class Game(models.Model):
    # Choices for rock-paper-scissors
    CHOICES = (
        ('rock', 'Rock'),
        ('paper', 'Paper'),
        ('scissors', 'Scissors'),
    )
    
    # Game fields
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='games')
    user_choice = models.CharField(max_length=10, choices=CHOICES)
    computer_choice = models.CharField(max_length=10, choices=CHOICES)
    result = models.CharField(max_length=10, choices=RESULTS, null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUSES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def calculate_result(self):
        """Calculate game result based on user and computer choices"""
        # Check for a draw
        if self.user_choice == self.computer_choice:
            self.result = 'draw'
        # Check for a win
        elif (
            (self.user_choice == 'rock' and self.computer_choice == 'scissors') or
            (self.user_choice == 'paper' and self.computer_choice == 'rock') or
            (self.user_choice == 'scissors' and self.computer_choice == 'paper')
        ):
            self.result = 'win'
        # Otherwise it's a loss
        else:
            self.result = 'lose'
        
        # Mark game as completed
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
        """Update statistics based on game result"""
        # Increment total games
        self.total_games += 1
        
        # Update specific result counter
        if result == 'win':
            self.wins += 1
        elif result == 'lose':
            self.losses += 1
        elif result == 'draw':
            self.draws += 1
            
        self.save()
``` 