# 🎮 Rock-Paper-Scissors Backend API

This is the Django backend API for the Rock-Paper-Scissors Telegram Mini App. It provides authentication, game logic, and data storage for the application.

## 📋 Overview

This backend handles everything that happens "behind the scenes" in our game:

- **Authenticating users** securely with Telegram
- **Processing game moves** (rock, paper, scissors)
- **Tracking statistics** (wins, losses, draws)
- **Storing user data** safely in a database

## 🏗️ Project Structure Explained for Beginners

```
backend/
├── core/                      # Main project settings
│   ├── settings.py            # Django configuration (database, auth, etc)
│   └── urls.py                # URL routing for the entire project
│
├── telegram_auth/             # Telegram authentication module
│   ├── models.py              # Defines how user data is stored
│   ├── views.py               # Contains authentication logic
│   ├── serializers.py         # Converts user data to/from JSON
│   └── urls.py                # URL routing for authentication endpoints
│
├── game/                      # Game logic module
│   ├── models.py              # Defines game data storage
│   ├── views.py               # Game logic (play, calculate winner, etc)
│   ├── serializers.py         # Converts game data to/from JSON
│   └── urls.py                # URL routing for game endpoints
│
├── manage.py                  # Django command-line tool
└── requirements.txt           # Python package dependencies
```

## 🔐 Authentication System Explained

The `telegram_auth` app handles secure user authentication through Telegram:

1. **How it Works**:
   - The frontend sends user data provided by Telegram
   - Our backend verifies this data is authentic using cryptographic signatures
   - We create or update the user account in our database
   - We return an authentication token for future requests

2. **Key Files**:
   - `telegram_auth/views.py`: Contains the `validate_telegram_data` function
   - `telegram_auth/models.py`: Defines the `TelegramUser` model

3. **Security Features**:
   - Checks hash signatures to verify data came from Telegram
   - Verifies timestamp to prevent replay attacks
   - Special "mock_hash" support for development/testing

## 🎲 Game System Explained

The `game` app handles the actual Rock-Paper-Scissors game logic:

1. **How it Works**:
   - Player sends their choice (rock, paper, scissors)
   - Backend generates a random choice for the computer
   - Backend determines the winner based on game rules
   - Results are saved and statistics are updated
   - Response is sent back to the frontend

2. **Key Files**:
   - `game/views.py`: Contains the game logic
   - `game/models.py`: Defines the `GameRound` and `PlayerStats` models

## 🚀 Getting Started

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation Step-by-Step

1. **Create a Virtual Environment**:
   ```bash
   # Create a virtual environment
   python -m venv venv
   
   # Activate it (Linux/Mac)
   source venv/bin/activate
   
   # Or on Windows
   venv\Scripts\activate
   ```

2. **Install Dependencies**:
   ```bash
   # Install required packages
   pip install -r requirements.txt
   ```

3. **Set Up the Database**:
   ```bash
   # Create database tables
   python manage.py migrate
   ```

4. **Run the Development Server**:
   ```bash
   # Start the server on localhost:8000
   python manage.py runserver
   ```

## 📡 API Endpoints Reference

### Authentication

- **POST /api/auth/telegram/**
  
  *Authenticates a user with Telegram data*
  
  **Request Body**:
  ```json
  {
    "id": "123456789",
    "first_name": "John",
    "last_name": "Doe",
    "username": "johndoe",
    "photo_url": "https://example.com/photo.jpg",
    "auth_date": "1600000000",
    "hash": "abcdef1234567890abcdef1234567890"
  }
  ```
  
  **Response**:
  ```json
  {
    "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
    "user": {
      "id": 1,
      "telegram_id": "123456789",
      "username": "johndoe",
      "first_name": "John",
      "last_name": "Doe",
      "photo_url": "https://example.com/photo.jpg"
    }
  }
  ```

### Game Play

- **POST /api/game/play/**
  
  *Plays a round of Rock-Paper-Scissors*
  
  **Request Body**:
  ```json
  {
    "user_choice": "rock"  // Can be "rock", "paper", or "scissors"
  }
  ```
  
  **Response**:
  ```json
  {
    "user_choice": "rock",
    "computer_choice": "scissors",
    "result": "win",       // Can be "win", "lose", or "draw"
    "message": "Rock crushes scissors. You win!"
  }
  ```

### Game Statistics

- **GET /api/game/stats/**
  
  *Retrieves player statistics*
  
  **Response**:
  ```json
  {
    "total_games": 10,
    "wins": 5,
    "losses": 3,
    "draws": 2,
    "win_percentage": 50
  }
  ```

## 🧩 Development Mode

### Testing Without Telegram

For development, you can use the mock hash feature:

1. Set `TELEGRAM_BOT_TOKEN` to an empty string in `settings.py`
2. Send a request with `"hash": "mock_hash"` to bypass validation

### Demo Data

You can use this example payload for testing authentication:

```json
{
  "id": "123456789",
  "first_name": "Test",
  "last_name": "User",
  "username": "testuser",
  "photo_url": "https://via.placeholder.com/150",
  "auth_date": "1600000000",
  "hash": "mock_hash"
}
```

## 🐛 Troubleshooting Common Issues

1. **"No module named 'django'"**
   - Make sure you've activated your virtual environment
   - Verify that Django is installed: `pip install django`

2. **Database errors**
   - Ensure migrations are applied: `python manage.py migrate`
   - Check database permissions and settings

3. **"Invalid authentication data"**
   - For development, make sure you're using "mock_hash"
   - For production, verify your bot token is correct

## 🔍 Code Examples

### Authentication Validation

```python
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
    
    # Verification logic...
```

## License

This project is licensed under the MIT License. 