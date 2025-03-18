# Backend Code Flow Explanation

This document explains the backend implementation of our Telegram Mini App, detailing the flow of data from the moment a request hits the server to when a response is sent back. We'll explore both the authentication system and the game logic, with detailed explanations for each line of code and example data from Postman testing.

## Table of Contents
- [Backend Code Flow Explanation](#backend-code-flow-explanation)
  - [Table of Contents](#table-of-contents)
  - [1. Telegram Authentication Flow](#1-telegram-authentication-flow)
    - [URL Routing (telegram_auth/urls.py)](#url-routing-telegram_authurlspy)
    - [Authentication Function (telegram_auth/views.py)](#authentication-function-telegram_authviewspy)
    - [Data Validation Process](#data-validation-process)
    - [User Creation or Update](#user-creation-or-update)
    - [Token Generation](#token-generation)
    - [Response Construction](#response-construction)
    - [User Model Structure (telegram_auth/models.py)](#user-model-structure-telegram_authmodelspy)
    - [User Serialization (telegram_auth/serializers.py)](#user-serialization-telegram_authserializerspy)
  - [2. Game Logic Flow](#2-game-logic-flow)
    - [URL Routing (game/urls.py)](#url-routing-gameurlspy)
    - [Game Play Function (game/views.py)](#game-play-function-gameviewspy)
    - [Game Statistics Function](#game-statistics-function)
    - [Game Models (game/models.py)](#game-models-gamemodelspy)
    - [Game Serializers (game/serializers.py)](#game-serializers-gameserializerspy)

## 1. Telegram Authentication Flow

The authentication flow is crucial for identifying and verifying Telegram users in our Mini App.

### URL Routing (telegram_auth/urls.py)

When a request comes in, Django's URL dispatcher examines `urls.py` to determine which function should handle it:

```python
from django.urls import path
from . import views

urlpatterns = [
    # Route POST requests to /api/auth/telegram/ to telegram_auth function
    path('telegram/', views.telegram_auth, name='telegram-auth'),
    
    # Route GET requests to /api/auth/profile/ to get_user_profile function
    path('profile/', views.get_user_profile, name='user-profile-get'),
    
    # Route PUT requests to /api/auth/profile/update/ to update_user_profile function
    path('profile/update/', views.update_user_profile, name='user-profile-update'),
]
```

This configuration maps URL patterns to view functions:
1. `telegram/` → `telegram_auth` function for Telegram authentication (POST)
2. `profile/` → `get_user_profile` function for retrieving profile (GET)
3. `profile/update/` → `update_user_profile` function for updating profile (PUT)

### Authentication Function (telegram_auth/views.py)

The `telegram_auth` function handles Telegram authentication:

```python
@api_view(["POST"])  # Only allows POST requests
@permission_classes([AllowAny])  # No authentication required for this endpoint
@transaction.atomic  # All database operations in a single transaction
def telegram_auth(request):
    """
    Authenticate a user via Telegram data and return user details with token.
    """
    # Debug the request
    print("Request Content-Type:", request.META.get('CONTENT_TYPE'))
    # Example value: "application/json"
    
    print("Request Body Type:", type(request.body))
    # Example value: <class 'bytes'>
    
    if len(request.body) > 200:
        print("Request Body (truncated):", request.body[:200], "...")
    else:
        print("Request Body:", request.body)
    # Example value: b'{"id":"123456789","first_name":"John","last_name":"Doe","username":"johndoe",...}'
    
    # Get data from request
    telegram_data = request.data  # DRF parses JSON into Python dict
    print("Parsed Data Type:", type(telegram_data))
    # Example value: <class 'dict'>
    
    if isinstance(telegram_data, dict) and len(telegram_data) > 0:
        print("Parsed Data Keys:", telegram_data.keys())
        # Example value: dict_keys(['id', 'first_name', 'last_name', 'username', 'photo_url', 'auth_date', 'hash'])
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
                telegram_data = json.loads(telegram_data)  # Convert string to dict
                print("Successfully converted string to JSON")
                # telegram_data now contains the parsed JSON as a dictionary
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
        # is_valid is a boolean, message is a string
        if not is_valid:
            print(f"Telegram data validation failed: {message}")
            return Response(
                {"error": message}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    else:
        print("TELEGRAM_BOT_TOKEN not set, skipping validation")
    
    # Extract Telegram ID
    telegram_id = telegram_data.get('id')
    # Example value: "123456789"
    
    if not telegram_id:
        print("Telegram ID missing from request data")
        return Response(
            {"error": "Telegram ID is missing"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # ... Rest of the function for user creation/update and token generation
```

In this function, we see:
1. The request data is parsed and validated
2. The request body is examined for debugging
3. The Telegram data is checked for required fields
4. The data authentication hash is validated (unless in development mode)
5. The Telegram ID is extracted for user lookup

### Data Validation Process

Telegram data validation is a critical security step:

```python
def validate_telegram_data(data):
    """
    Validate data received from Telegram Mini App
    """
    # For development: allow mock_hash
    if data.get('hash') == 'mock_hash':
        print("Detected mock hash, skipping validation for development/demo mode")
        return True, "Mock data is valid"
    
    if not settings.TELEGRAM_BOT_TOKEN:
        print("No bot token set, skipping validation")
        return True, "No bot token set, skipping validation"
    
    # Check if auth_date is fresh (not older than 24 hours)
    current_time = int(time.time())  # Current Unix timestamp
    auth_time = int(data.get('auth_date', 0))  # Auth timestamp from Telegram
    
    # Example values:
    # current_time = 1647500000 (March 17, 2022)
    # auth_time = 1647450000 (March 16, 2022)
    # diff = 50000 seconds (about 14 hours)
    
    if current_time - auth_time > 86400:  # 86400 seconds = 24 hours
        return False, "Authentication data is outdated"

    # Create data check string by sorting and joining all fields except hash
    sorted_data = sorted([(k, v) for k, v in data.items() if k != 'hash'])
    # Example: [('auth_date', '1647450000'), ('first_name', 'John'), ('id', '123456789'), ...]
    
    data_check_string = '\n'.join([f"{k}={v}" for k, v in sorted_data])
    # Example: "auth_date=1647450000\nfirst_name=John\nid=123456789\n..."
    
    # Create secret key from bot token
    bot_token = settings.TELEGRAM_BOT_TOKEN  # e.g., "1234567890:AABBCCDDEEFFGGHHIIJJKKLLMMNNOOPPQQRRs"
    secret_key = hashlib.sha256(bot_token.encode()).digest()
    # secret_key is now a binary digest of the SHA256 hash of the bot token
    
    # Compute hash using HMAC-SHA256
    computed_hash = hmac.new(
        secret_key,
        data_check_string.encode(),
        hashlib.sha256
    ).hexdigest()
    # computed_hash example: "9c5f1bb7a8c5f1bb7a8c5f1bb7a8c5f1bb7a8c5f1bb7a8c5f1bb7a8c5f1bb7a8"
    
    # Compare computed hash with provided hash
    provided_hash = data.get('hash')  # e.g., "9c5f1bb7a8c5f1bb7a8c5f1bb7a8c5f1bb7a8c5f1bb7a8c5f1bb7a8c5f1bb7a8"
    
    if computed_hash != provided_hash:
        return False, "Data hash is invalid"
    
    return True, "Data is valid"
```

This function:
1. First checks if we're using a mock hash for development (returns valid)
2. Checks if the auth_date is recent (within 24 hours)
3. Creates a data check string by sorting fields (except hash) and joining them
4. Creates a secret key by hashing the Telegram bot token
5. Computes an HMAC-SHA256 hash of the data check string
6. Compares the computed hash with the provided hash to verify authenticity

### User Creation or Update

After validating the data, the system either creates a new user or updates an existing one:

```python
# Get or create user
try:
    # Try to find existing TelegramUser
    telegram_user = TelegramUser.objects.get(telegram_id=telegram_id)
    # telegram_id example: "123456789"
    
    user = telegram_user.user  # Get associated Django User
    print(f"Existing user found: {user.username}")
    # Example: "Existing user found: johndoe"
    
    # Update user data with latest from Telegram
    telegram_user.username = telegram_data.get('username')  # e.g., "johndoe"
    telegram_user.first_name = telegram_data.get('first_name', '')  # e.g., "John"
    telegram_user.last_name = telegram_data.get('last_name', '')  # e.g., "Doe"
    telegram_user.photo_url = telegram_data.get('photo_url')  # e.g., "https://t.me/i/userpic/320/johndoe.jpg"
    telegram_user.auth_date = telegram_data.get('auth_date')  # e.g., "1647450000"
    telegram_user.save()  # Save the updated data to the database
    print("User data updated")
    
except TelegramUser.DoesNotExist:
    # No existing user found, create a new one
    username = telegram_data.get('username') or f"tg_{telegram_id}"
    print(f"Creating new user with username: {username}")
    # Example: "Creating new user with username: johndoe"
    
    # Make sure username is unique by appending telegram_id if needed
    if User.objects.filter(username=username).exists():
        username = f"{username}_{telegram_id}"  # e.g., "johndoe_123456789"
        print(f"Username already exists, using {username} instead")
    
    # Create a Django User (without password)
    user = User.objects.create_user(
        username=username,  # e.g., "johndoe"
        email='',  # No email required for Telegram auth
        password=None  # No password needed
    )
    print(f"User created: {user.id}")  # e.g., "User created: 1"
    
    # Create TelegramUser linked to Django User
    telegram_user = TelegramUser.objects.create(
        user=user,  # The Django User we just created
        telegram_id=telegram_id,  # e.g., "123456789"
        username=telegram_data.get('username'),  # e.g., "johndoe"
        first_name=telegram_data.get('first_name', ''),  # e.g., "John"
        last_name=telegram_data.get('last_name', ''),  # e.g., "Doe"
        photo_url=telegram_data.get('photo_url'),  # e.g., "https://t.me/i/userpic/320/johndoe.jpg"
        auth_date=telegram_data.get('auth_date')  # e.g., "1647450000"
    )
    print(f"TelegramUser created: {telegram_user.id}")  # e.g., "TelegramUser created: 1"
```

This code:
1. First tries to find an existing TelegramUser with the provided telegram_id
   - If found, it updates the user's data with latest info from Telegram
   - The values like username, first_name, etc. are updated to match current Telegram data
2. If no user exists, it creates both a Django User and a TelegramUser:
   - First, generates a username based on Telegram username or ID
   - Ensures the username is unique by adding the telegram_id if needed
   - Creates a new Django User with no password (using Telegram for auth)
   - Creates a TelegramUser linked to this Django User with all Telegram data

### Token Generation

After user creation/update, an authentication token is generated:

```python
# Create or get token
token, created = Token.objects.get_or_create(user=user)
# token is the Token object, created is a boolean (True if new token created)

if created:
    print("New token created")
    # token.key example: "9c5f1bb7a8c5f1bb7a8c5f1bb7a8c5f1bb7a8c5f"
else:
    print("Using existing token")
    # token.key example: "9c5f1bb7a8c5f1bb7a8c5f1bb7a8c5f1bb7a8c5f"
```

This code:
1. Uses Django REST Framework's Token model to get or create an auth token
2. If a token already exists for this user, it reuses it
3. If no token exists, it creates a new one
4. The `created` boolean tells us if a new token was created or an existing one retrieved

### Response Construction

Finally, the user data and token are returned to the client:

```python
# Return user data and token
serializer = TelegramUserSerializer(telegram_user)
# serializer.data contains all the TelegramUser fields as a dictionary

response_data = {
    'token': token.key,  # e.g., "9c5f1bb7a8c5f1bb7a8c5f1bb7a8c5f1bb7a8c5f"
    'user': serializer.data  # Contains all user fields (id, telegram_id, username, etc.)
}

print("Authentication successful, returning token and user data")
return Response(response_data)  # Return as JSON with 200 OK status
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

The response:
1. Contains the authentication token for future requests
2. Includes the serialized user data with all relevant user information
3. Is sent with a 200 OK status code

### User Model Structure (telegram_auth/models.py)

The TelegramUser model stores Telegram-specific user information:

```python
class TelegramUser(models.Model):
    # One-to-one relationship with Django's built-in User model
    user = models.OneToOneField(
        User,  # Django's User model
        on_delete=models.CASCADE,  # Delete TelegramUser if User is deleted
        related_name='telegram_user'  # Access via user.telegram_user
    )
    
    # Telegram-specific fields
    telegram_id = models.BigIntegerField(unique=True)  # Telegram's unique user ID
    username = models.CharField(max_length=255, blank=True, null=True)  # @username (optional)
    first_name = models.CharField(max_length=255)  # User's first name
    last_name = models.CharField(max_length=255, blank=True, null=True)  # Last name (optional)
    photo_url = models.URLField(blank=True, null=True)  # Profile picture URL (optional)
    auth_date = models.IntegerField()  # Unix timestamp of authentication
    
    def __str__(self):
        return f"{self.first_name} {self.last_name or ''} (@{self.username or 'no username'})"
        # Example: "John Doe (@johndoe)"
```

Example database row:
```
id: 1
user_id: 1
telegram_id: 123456789
username: "johndoe"
first_name: "John"
last_name: "Doe"
photo_url: "https://t.me/i/userpic/320/johndoe.jpg"
auth_date: 1617346200
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
    """Serializer for Django's built-in User model"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email']  # Only expose these fields
        read_only_fields = ['id', 'username']  # These can't be modified via API

class TelegramUserSerializer(serializers.ModelSerializer):
    """Serializer for TelegramUser model"""
    user = UserSerializer(read_only=True)  # Nest User serializer
    
    class Meta:
        model = TelegramUser
        fields = [
            'id', 'user', 'telegram_id', 'username', 
            'first_name', 'last_name', 'photo_url', 'auth_date'
        ]
        read_only_fields = ['id', 'user', 'telegram_id', 'auth_date']  # Can't modify these
```

Example serialized output:
```json
{
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
```

These serializers:
1. Define how to convert User and TelegramUser models to and from JSON
2. Specify which fields should be included in the serialized data
3. Mark certain fields as read-only to prevent modification
4. Nest the User serializer inside the TelegramUser serializer for a complete representation

## 2. Game Logic Flow

The game logic handles rock-paper-scissors game actions and statistics tracking.

### URL Routing (game/urls.py)

Game-related URLs are defined as follows:

```python
from django.urls import path
from . import views

urlpatterns = [
    # Route POST requests to /api/game/play/ to play_game function
    path('play/', views.play_game, name='play-game'),
    
    # Route GET requests to /api/game/history/ to get_game_history function
    path('history/', views.get_game_history, name='game-history'),
    
    # Route GET requests to /api/game/stats/ to get_game_stats function
    path('stats/', views.get_game_stats, name='game-stats'),
]
```

This routing means:
1. `play/` → `play_game` function for playing a game (POST) and storing results
2. `history/` → `get_game_history` function for retrieving game history (GET)
3. `stats/` → `get_game_stats` function for retrieving game statistics (GET)

### Game Play Function (game/views.py)

The `play_game` function handles playing a game of rock-paper-scissors:

```python
@api_view(["POST"])  # Only allows POST requests
@permission_classes([IsAuthenticated])  # Requires authentication
@transaction.atomic  # All database operations in a single transaction
def play_game(request):
    """
    Play a game of rock-paper-scissors.
    """
    # Copy request data and add user ID
    data = request.data.copy()  # Copy request data dict
    data['user'] = request.user.id  # Add authenticated user's ID
    # Example: data = {'user_choice': 'rock', 'user': 1}
    
    # Validate data
    serializer = GameSerializer(data=data)
    if serializer.is_valid():
        # Create a game instance but don't fully save yet
        game = serializer.save()  # Creates Game object with user_choice
        # game.id = 1, game.user_id = 1, game.user_choice = 'rock'
        
        # Generate computer's choice randomly
        choices = [choice[0] for choice in Game.CHOICES]  # ['rock', 'paper', 'scissors']
        game.computer_choice = random.choice(choices)  # e.g., 'scissors'
        print(f"Computer chose: {game.computer_choice}")
        
        # Calculate result
        result = game.calculate_result()  # e.g., 'win'
        print(f"Game result: {result}")
        
        # Update or create game stats
        stats, created = GameStats.objects.get_or_create(user=request.user)
        # If stats exist: stats=<GameStats: user=1, total_games=5, wins=3, losses=1, draws=1>
        # If created: stats=<GameStats: user=1, total_games=0, wins=0, losses=0, draws=0>
        
        stats.update_stats(result)  # Update based on game result
        # If result='win': stats.wins += 1, stats.total_games += 1
        # After update: stats=<GameStats: user=1, total_games=6, wins=4, losses=1, draws=1>
        
        print(f"Updated stats: {stats.wins} wins, {stats.losses} losses, {stats.draws} draws")
        
        # Return game data
        return Response(GameSerializer(game).data)
        # Returns serialized game data with HTTP 200 OK
    
    # Invalid data
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    # Returns validation errors with HTTP 400 Bad Request
```

Example response:
```json
{
    "id": 1,
    "user": 1,
    "user_choice": "rock",
    "computer_choice": "scissors",
    "result": "win",
    "status": "completed",
    "created_at": "2023-03-18T10:25:30.123456Z",
    "updated_at": "2023-03-18T10:25:30.123456Z"
}
```

The function flow:
1. Copies the request data and adds the authenticated user's ID
2. Validates the data using the GameSerializer
3. Creates a Game instance with the user's choice
4. Randomly generates the computer's choice
5. Calculates the game result using the model's `calculate_result()` method
6. Updates the user's game statistics to reflect this game's outcome
7. Returns the completed game data to the client

### Game Statistics Function

The `get_game_stats` function returns the user's game statistics:

```python
@api_view(["GET"])  # Only allows GET requests
@permission_classes([IsAuthenticated])  # Requires authentication
def get_game_stats(request):
    """
    Get user's game statistics.
    """
    # Get or create stats for the user
    stats, created = GameStats.objects.get_or_create(user=request.user)
    # If stats exist: stats=<GameStats: user=1, total_games=6, wins=4, losses=1, draws=1>
    # If created: stats=<GameStats: user=1, total_games=0, wins=0, losses=0, draws=0>
    
    # Serialize stats and return
    serializer = GameStatsSerializer(stats)
    return Response(serializer.data)
    # Returns serialized stats data with HTTP 200 OK
```

Example response:
```json
{
    "id": 1,
    "user": 1,
    "total_games": 6,
    "wins": 4,
    "losses": 1,
    "draws": 1,
    "win_percentage": 66.67
}
```

This function:
1. Retrieves the authenticated user's game statistics
2. Creates a new GameStats record if one doesn't exist
3. Serializes the statistics and returns them to the client

### Game Models (game/models.py)

The Game model represents a single game instance:

```python
class Game(models.Model):
    # Choices for rock-paper-scissors
    CHOICES = (
        ('rock', 'Rock'),
        ('paper', 'Paper'),
        ('scissors', 'Scissors'),
    )
    
    # Game status choices
    STATUSES = (
        ('active', 'Active'),
        ('completed', 'Completed'),
    )
    
    # Possible game results
    RESULTS = (
        ('win', 'Win'),
        ('lose', 'Lose'),
        ('draw', 'Draw'),
    )
    
    # Game fields
    user = models.ForeignKey(
        User,  # Django's User model
        on_delete=models.CASCADE,  # Delete Game if User is deleted
        related_name='games'  # Access via user.games.all()
    )
    user_choice = models.CharField(max_length=10, choices=CHOICES)  # e.g., 'rock'
    computer_choice = models.CharField(max_length=10, choices=CHOICES)  # e.g., 'scissors'
    result = models.CharField(
        max_length=10, 
        choices=RESULTS, 
        null=True, 
        blank=True
    )  # e.g., 'win'
    status = models.CharField(
        max_length=10, 
        choices=STATUSES, 
        default='active'
    )  # e.g., 'completed'
    created_at = models.DateTimeField(auto_now_add=True)  # e.g., '2023-03-18T10:25:30.123456Z'
    updated_at = models.DateTimeField(auto_now=True)  # e.g., '2023-03-18T10:25:30.123456Z'
    
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
        self.save()  # Save changes to database
        
        return self.result  # Return result for convenience
```

Example database row:
```
id: 1
user_id: 1
user_choice: "rock"
computer_choice: "scissors"
result: "win"
status: "completed"
created_at: "2023-03-18 10:25:30.123456"
updated_at: "2023-03-18 10:25:30.123456"
```

The GameStats model tracks user statistics:

```python
class GameStats(models.Model):
    # One-to-one relationship with User
    user = models.OneToOneField(
        User,  # Django's User model
        on_delete=models.CASCADE,  # Delete GameStats if User is deleted
        related_name='game_stats'  # Access via user.game_stats
    )
    
    # Statistics fields
    total_games = models.IntegerField(default=0)  # e.g., 6
    wins = models.IntegerField(default=0)  # e.g., 4
    losses = models.IntegerField(default=0)  # e.g., 1
    draws = models.IntegerField(default=0)  # e.g., 1
    
    def update_stats(self, result):
        """Update statistics based on game result"""
        # Increment total games
        self.total_games += 1  # e.g., 6 -> 7
        
        # Update specific result counter
        if result == 'win':
            self.wins += 1  # e.g., 4 -> 5
        elif result == 'lose':
            self.losses += 1  # e.g., 1 -> 2
        elif result == 'draw':
            self.draws += 1  # e.g., 1 -> 2
            
        self.save()  # Save changes to database
```

Example database row:
```
id: 1
user_id: 1
total_games: 6
wins: 4
losses: 1
draws: 1
```

These models:
1. Define the structure for storing game data and user statistics
2. Include game logic like calculating the winner based on player and computer choices
3. Provide methods for updating statistics based on game results

### Game Serializers (game/serializers.py)

The serializers convert game data to and from JSON:

```python
class GameSerializer(serializers.ModelSerializer):
    """Serializer for Game model"""
    class Meta:
        model = Game
        fields = [
            'id', 'user', 'user_choice', 'computer_choice', 
            'result', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'computer_choice', 'result', 
            'status', 'created_at', 'updated_at'
        ]  # These can't be set by the client

    def validate_user_choice(self, value):
        """Validate that the user's choice is valid"""
        valid_choices = [choice[0] for choice in Game.CHOICES]  # ['rock', 'paper', 'scissors']
        
        if value not in valid_choices:
            raise serializers.ValidationError(
                f"Invalid choice. Must be one of: {', '.join(valid_choices)}"
            )
            # Example error: "Invalid choice. Must be one of: rock, paper, scissors"
            
        return value


class GameStatsSerializer(serializers.ModelSerializer):
    """Serializer for GameStats model with calculated win percentage"""
    win_percentage = serializers.SerializerMethodField()  # Calculated field
    
    class Meta:
        model = GameStats
        fields = [
            'id', 'user', 'total_games', 'wins', 
            'losses', 'draws', 'win_percentage'
        ]
        read_only_fields = [
            'id', 'user', 'total_games', 'wins', 
            'losses', 'draws', 'win_percentage'
        ]  # All fields are read-only
    
    def get_win_percentage(self, obj):
        """Calculate win percentage from stats"""
        if obj.total_games > 0:
            percentage = (obj.wins / obj.total_games) * 100
            return round(percentage, 2)  # e.g., 66.67
        return 0.0  # No games played
```

Example serialized Game output:
```json
{
    "id": 1,
    "user": 1,
    "user_choice": "rock",
    "computer_choice": "scissors",
    "result": "win",
    "status": "completed",
    "created_at": "2023-03-18T10:25:30.123456Z",
    "updated_at": "2023-03-18T10:25:30.123456Z"
}
```

Example serialized GameStats output:
```json
{
    "id": 1,
    "user": 1,
    "total_games": 6,
    "wins": 4,
    "losses": 1,
    "draws": 1,
    "win_percentage": 66.67
}
```

These serializers:
1. Define how to convert Game and GameStats models to and from JSON
2. Specify which fields should be included in the serialized data
3. Add custom validation for user choices
4. Include calculated fields like win_percentage that aren't directly stored in the database
</rewritten_file> 