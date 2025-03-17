# Telegram Mini App - Rock Paper Scissors

This is a simple Rock Paper Scissors game implemented as a Telegram Mini App. It demonstrates how to create a Telegram Mini App with Django Rest Framework as the backend and a simple HTML/CSS/JavaScript frontend.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
  - [1. Create a Telegram Bot](#1-create-a-telegram-bot)
  - [2. Set Up the Backend](#2-set-up-the-backend)
  - [3. Set Up the Frontend](#3-set-up-the-frontend)
  - [4. Deploy Your Application (Free Methods)](#4-deploy-your-application-free-methods)
  - [5. Configure the Telegram Mini App](#5-configure-the-telegram-mini-app)
- [Data Flow](#data-flow)
- [API Endpoints](#api-endpoints)
- [Telegram Mini App Integration](#telegram-mini-app-integration)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Overview

This project demonstrates how to build a Telegram Mini App that integrates with a Django Rest Framework backend. The app is a simple Rock Paper Scissors game where users can:

1. Authenticate using their Telegram account
2. Play the game against the computer
3. View their game statistics

## Features

- Telegram user authentication
- Rock Paper Scissors game
- Game history and statistics
- Responsive design that adapts to Telegram's theme

## Project Structure

```
telegram-mini-app/
├── backend/                # Django backend
│   ├── core/               # Django project settings
│   ├── telegram_auth/      # Telegram authentication app
│   ├── game/               # Game logic app
│   ├── venv/               # Python virtual environment
│   ├── manage.py           # Django management script
│   └── requirements.txt    # Python dependencies
├── frontend/               # Frontend application
│   ├── public/             # Static files
│   │   └── index.html      # Main HTML file
│   └── src/                # Source files
│       ├── app.js          # JavaScript logic
│       └── styles.css      # CSS styles
└── README.md               # This file
```

## Setup Instructions

### 1. Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Start a chat with BotFather and send the command `/newbot`
3. Follow the instructions to create a new bot
4. Once created, you'll receive a bot token. Save this token for later use.
5. Send the command `/mybots` to BotFather
6. Select your newly created bot
7. Select "Bot Settings" > "Menu Button" > "Configure Menu Button"
8. Set the menu button URL to your frontend URL (e.g., `https://yourdomain.com/frontend/public/index.html`)
9. Send the command `/setdomain` to BotFather
10. Select your bot and enter your domain (e.g., `yourdomain.com`)

### 2. Set Up the Backend

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/telegram-mini-app.git
   cd telegram-mini-app/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install django djangorestframework django-cors-headers
   ```

4. Update the `TELEGRAM_BOT_TOKEN` in `core/settings.py` with your bot token:
   ```python
   TELEGRAM_BOT_TOKEN = 'your_bot_token_here'
   ```

5. Apply migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. Create a superuser (for admin access):
   ```bash
   python manage.py createsuperuser
   ```

7. Run the development server:
   ```bash
   python manage.py runserver
   ```

### 3. Set Up the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Update the API URL in `src/app.js` to point to your backend:
   ```javascript
   const API_URL = 'http://your-backend-url/api';
   ```

3. Serve the frontend files using a web server of your choice. For development, you can use Python's built-in HTTP server:
   ```bash
   cd public
   python -m http.server 8080
   ```

### 4. Deploy Your Application (Free Methods)

#### For Development/Testing (Using ngrok)

[ngrok](https://ngrok.com/) provides temporary public URLs for your local server:

1. Install ngrok:
   ```bash
   # On macOS with Homebrew
   brew install ngrok
   
   # On Windows with Chocolatey
   choco install ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. Start your Django backend:
   ```bash
   cd backend
   python3 manage.py runserver
   ```

3. In a new terminal, start ngrok pointing to your Django server:
   ```bash
   ngrok http 8000
   ```

4. Note the HTTPS URL provided by ngrok (e.g., `https://abc123def456.ngrok.io`)

5. Use this URL for your backend in the frontend code.

6. For the frontend, start a local server:
   ```bash
   cd frontend/public
   python3 -m http.server 8080
   ```

7. Start another ngrok tunnel for the frontend:
   ```bash
   ngrok http 8080
   ```

8. Use this second ngrok URL in BotFather for your Mini App.

#### For Production (Free Options)

**Backend (PythonAnywhere)**:

1. Sign up for a free account at [PythonAnywhere](https://www.pythonanywhere.com/)

2. From the Dashboard, click on "Web" and then "Add a new web app"

3. Select "Manual configuration" and "Python 3.x"

4. In the "Files" section, upload your Django project or clone it from GitHub:
   ```bash
   git clone https://github.com/yourusername/telegram-mini-app.git
   ```

5. Create a virtual environment:
   ```bash
   cd telegram-mini-app
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

6. Configure your web app:
   - Source code: `/home/yourusername/telegram-mini-app/backend`
   - Working directory: `/home/yourusername/telegram-mini-app/backend`
   - WSGI configuration file: Edit with your Django project settings

7. Configure your ALLOWED_HOSTS in settings.py:
   ```python
   ALLOWED_HOSTS = ['yourusername.pythonanywhere.com']
   ```

8. Set up CORS to allow requests from your frontend:
   ```python
   CORS_ALLOWED_ORIGINS = [
       "https://yourusername.github.io",
   ]
   ```

9. Apply migrations and create a superuser.

10. Your API will be available at `https://yourusername.pythonanywhere.com/api/`

**Frontend (GitHub Pages)**:

1. Create a repository on GitHub for your frontend code

2. Push your frontend code to this repository:
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/mini-app-frontend.git
   git push -u origin main
   ```

3. Go to your repository settings > Pages

4. Select the branch to deploy (usually `main`) and the folder (usually `/` or `/public`)

5. GitHub will provide a URL like `https://yourusername.github.io/mini-app-frontend`

6. Update your frontend code to use the PythonAnywhere backend URL:
   ```javascript
   const API_URL = 'https://yourusername.pythonanywhere.com/api';
   ```

7. Push the changes to GitHub, and GitHub Pages will automatically update.

8. Use the GitHub Pages URL in BotFather for your Mini App.


### 5. Configure the Telegram Mini App

1. Go back to BotFather and send the command `/newapp`
2. Select your bot
3. Follow the instructions to create a new Mini App
4. Set the Web App URL to your frontend URL (e.g., `https://yourdomain.com/frontend/public/index.html`)
5. Once created, you can access your Mini App by clicking the Menu Button in your bot's chat


## Data Flow

The data flow between Telegram, the frontend, and the backend is as follows:

### 1. User Authentication and Registration

When a user opens your Telegram Mini App, the following process occurs automatically:

#### Frontend (JavaScript)
```javascript
// Get the Telegram Web App instance
const tg = window.Telegram.WebApp;

// Expand the Web App to take the full screen
tg.expand();

// Get the initData from Telegram (contains user info and authentication data)
const initData = tg.initData;

// Send initData to backend for validation
fetch('https://your-backend-url/api/auth/telegram/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ initData }),
})
  .then(response => response.json())
  .then(data => {
    // Store the authentication token for future API calls
    localStorage.setItem('auth_token', data.token);
    
    // Store user information
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Update UI with user information
    document.getElementById('username').textContent = 
      data.user.first_name + (data.user.last_name ? ' ' + data.user.last_name : '');
    
    // Show the game interface instead of login screen
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('game-interface').style.display = 'block';
  })
  .catch(error => {
    console.error('Authentication failed:', error);
    // Show error message to user
  });
```

#### Backend (Django)
```python
# views.py in telegram_auth app
import hashlib
import hmac
import json
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import TelegramUser

class TelegramAuthView(APIView):
    def post(self, request):
        # Get the initData from the request
        init_data = request.data.get('initData')
        
        # Validate the data using Telegram's validation method
        # See: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
        user_data = self.validate_telegram_data(init_data)
        
        if not user_data:
            return Response({"error": "Invalid authentication data"}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Create or update the user in the database
        user, created = TelegramUser.objects.update_or_create(
            telegram_id=user_data['id'],
            defaults={
                'username': user_data.get('username', ''),
                'first_name': user_data.get('first_name', ''),
                'last_name': user_data.get('last_name', ''),
                'language_code': user_data.get('language_code', 'en'),
                'is_premium': user_data.get('is_premium', False),
            }
        )
        
        # Generate an authentication token
        token = self.generate_auth_token(user)
        
        # Return the user data and token
        return Response({
            "user": {
                "id": user.telegram_id,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "language_code": user.language_code,
                "is_premium": user.is_premium
            },
            "token": token,
            "is_new_user": created
        }, status=status.HTTP_200_OK)
    
    def validate_telegram_data(self, init_data):
        """
        Validate the data received from Telegram Mini App
        
        See: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
        """
        try:
            # Parse the init_data
            data_parts = init_data.split('&')
            hash_value = None
            data_check_string = []
            
            # Extract hash and data check string
            for part in data_parts:
                if part.startswith('hash='):
                    hash_value = part[5:]
                else:
                    data_check_string.append(part)
            
            # Sort the data check string
            data_check_string = '\n'.join(sorted(data_check_string))
            
            # Generate the secret key
            secret_key = hmac.new(
                key=b"WebAppData",
                msg=settings.TELEGRAM_BOT_TOKEN.encode(),
                digestmod=hashlib.sha256
            ).digest()
            
            # Verify the hash
            calculated_hash = hmac.new(
                key=secret_key,
                msg=data_check_string.encode(),
                digestmod=hashlib.sha256
            ).hexdigest()
            
            # Return the user data if valid
            if calculated_hash == hash_value:
                # Extract user data
                for part in data_check_string.split('\n'):
                    if part.startswith('user='):
                        user_json = part[5:]
                        return json.loads(user_json)
            
            return None
        except Exception as e:
            print(f"Validation error: {str(e)}")
            return None
    
    def generate_auth_token(self, user):
        # Generate a token for the user (in a real app, use JWT or another token method)
        import uuid
        token = str(uuid.uuid4())
        user.auth_token = token
        user.save()
        return token
```

### 2. Game Play

Once authenticated, the user can interact with the game:

#### Frontend (JavaScript)
```javascript
// Game choice buttons
document.querySelectorAll('.choice-button').forEach(button => {
  button.addEventListener('click', function() {
    const playerChoice = this.dataset.choice; // 'rock', 'paper', or 'scissors'
    playGame(playerChoice);
  });
});

// Function to play a game
function playGame(playerChoice) {
  // Show loading state
  document.getElementById('result-area').innerHTML = '<div class="spinner"></div>';
  
  // Get the authentication token from localStorage
  const token = localStorage.getItem('auth_token');
  
  // Send the player's choice to the backend
  fetch('https://your-backend-url/api/game/play/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}` // Include auth token in header
    },
    body: JSON.stringify({
      choice: playerChoice
    })
  })
    .then(response => response.json())
    .then(data => {
      // Update the UI with the game result
      document.getElementById('player-choice').textContent = 
        getEmojiForChoice(data.player_choice);
      document.getElementById('computer-choice').textContent = 
        getEmojiForChoice(data.computer_choice);
      
      // Display the result
      const resultText = data.result === 'win' ? 'You win!' : 
                         data.result === 'lose' ? 'You lose!' : 'It\'s a draw!';
      document.getElementById('result-text').textContent = resultText;
      
      // Add appropriate CSS class for styling
      const resultContainer = document.getElementById('result-container');
      resultContainer.className = 'result-container ' + data.result;
      
      // Update the game statistics
      updateStats();
      
      // Show Telegram MainButton for playing again
      window.Telegram.WebApp.MainButton.setText('Play Again');
      window.Telegram.WebApp.MainButton.show();
    })
    .catch(error => {
      console.error('Game play error:', error);
      document.getElementById('result-area').innerHTML = 
        '<p class="error">Something went wrong. Please try again.</p>';
    });
}

// Helper function to convert choice to emoji
function getEmojiForChoice(choice) {
  switch(choice) {
    case 'rock': return '✊';
    case 'paper': return '✋';
    case 'scissors': return '✌️';
    default: return '❓';
  }
}
```

#### Backend (Django)
```python
# views.py in game app
import random
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Game
from .serializers import GameSerializer

class GamePlayView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Get the player's choice from the request
        player_choice = request.data.get('choice')
        
        # Validate the choice
        if player_choice not in ['rock', 'paper', 'scissors']:
            return Response({
                "error": "Invalid choice. Must be 'rock', 'paper', or 'scissors'."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate a random choice for the computer
        choices = ['rock', 'paper', 'scissors']
        computer_choice = random.choice(choices)
        
        # Determine the winner
        if player_choice == computer_choice:
            result = 'draw'
        elif (player_choice == 'rock' and computer_choice == 'scissors') or \
             (player_choice == 'paper' and computer_choice == 'rock') or \
             (player_choice == 'scissors' and computer_choice == 'paper'):
            result = 'win'
        else:
            result = 'lose'
        
        # Save the game result in the database
        game = Game.objects.create(
            user=request.user,
            player_choice=player_choice,
            computer_choice=computer_choice,
            result=result
        )
        
        # Return the game result
        return Response({
            "id": game.id,
            "player_choice": player_choice,
            "computer_choice": computer_choice,
            "result": result,
            "timestamp": game.created_at
        }, status=status.HTTP_200_OK)
```

### 3. Game Statistics

The user can view their game statistics:

#### Frontend (JavaScript)
```javascript
// Function to update game statistics
function updateStats() {
  // Get the authentication token
  const token = localStorage.getItem('auth_token');
  
  // Fetch game statistics from the backend
  fetch('https://your-backend-url/api/game/stats/', {
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`
    }
  })
    .then(response => response.json())
    .then(stats => {
      // Update the statistics in the UI
      document.getElementById('total-games').textContent = stats.total_games;
      document.getElementById('wins').textContent = stats.wins;
      document.getElementById('losses').textContent = stats.losses;
      document.getElementById('draws').textContent = stats.draws;
      
      // Calculate and display win rate
      const winRate = stats.total_games > 0 
        ? ((stats.wins / stats.total_games) * 100).toFixed(1) + '%' 
        : '0%';
      document.getElementById('win-rate').textContent = winRate;
    })
    .catch(error => {
      console.error('Error fetching game statistics:', error);
    });
}
```

#### Backend (Django)
```python
# views.py in game app (continued)
class GameStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Get the authenticated user from the request
        user = request.user
        
        # Get all games for this user
        user_games = Game.objects.filter(user=user)
        total_games = user_games.count()
        
        # Count wins, losses, and draws
        wins = user_games.filter(result='win').count()
        losses = user_games.filter(result='lose').count()
        draws = user_games.filter(result='draw').count()
        
        # Calculate win rate
        win_rate = (wins / total_games) * 100 if total_games > 0 else 0
        
        # Return the statistics
        return Response({
            'total_games': total_games,
            'wins': wins,
            'losses': losses,
            'draws': draws,
            'win_rate': round(win_rate, 1)
        }, status=status.HTTP_200_OK)
```

## Telegram Mini App Integration

The frontend integrates with Telegram using the [Telegram Web App API](https://core.telegram.org/bots/webapps). Here's a comprehensive guide to the integration:

### 1. Setup and Initialization

First, include the Telegram Web App script in your HTML file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rock Paper Scissors</title>
  <link rel="stylesheet" href="styles.css">
  <!-- Include Telegram Web App script -->
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
</head>
<body>
  <div id="login-screen">
    <h1>Welcome to Rock Paper Scissors</h1>
    <p>Please login with Telegram to continue</p>
    <button id="login-button">Login with Telegram</button>
    <div id="loading" style="display: none;">
      <div class="spinner"></div>
      <p>Authenticating...</p>
    </div>
    <p id="error-message" class="error"></p>
  </div>
  
  <div id="game-interface" style="display: none;">
    <h1>Rock Paper Scissors</h1>
    <h2>Welcome, <span id="username">User</span>!</h2>
    
    <h3>Make your choice:</h3>
    <div class="choices">
      <button class="choice-button" data-choice="rock">✊ Rock</button>
      <button class="choice-button" data-choice="paper">✋ Paper</button>
      <button class="choice-button" data-choice="scissors">✌️ Scissors</button>
    </div>
    
    <div class="result-container" id="result-container">
      <h3>Result:</h3>
      <div id="result-area">
        <div class="choices-display">
          <div>
            <h4>You chose:</h4>
            <div class="choice-display" id="player-choice"></div>
          </div>
          <div>
            <h4>Computer chose:</h4>
            <div class="choice-display" id="computer-choice"></div>
          </div>
        </div>
        <h3 id="result-text"></h3>
      </div>
    </div>
    
    <div class="stats-container">
      <h3>Your Stats:</h3>
      <div class="stats-row">
        <span class="stats-label">Total Games:</span>
        <span class="stats-value" id="total-games">0</span>
      </div>
      <div class="stats-row">
        <span class="stats-label">Wins:</span>
        <span class="stats-value" id="wins">0</span>
      </div>
      <div class="stats-row">
        <span class="stats-label">Losses:</span>
        <span class="stats-value" id="losses">0</span>
      </div>
      <div class="stats-row">
        <span class="stats-label">Draws:</span>
        <span class="stats-value" id="draws">0</span>
      </div>
      <div class="stats-row">
        <span class="stats-label">Win Rate:</span>
        <span class="stats-value" id="win-rate">0%</span>
      </div>
    </div>
  </div>
  
  <script src="app.js"></script>
</body>
</html>
```

### 2. Advanced Telegram Integration

The app.js file initializes the Telegram Web App and handles user interactions:

```javascript
// Initialize the Telegram Web App
document.addEventListener('DOMContentLoaded', function() {
  // Get the Telegram Web App instance
  const tg = window.Telegram.WebApp;
  
  if (!tg) {
    console.error("Telegram WebApp is not available");
    document.body.innerHTML = "<h1>Error: This app must be opened from Telegram</h1>";
    return;
  }
  
  // Expand the Web App to take the full screen
  tg.expand();
  
  // Apply Telegram theme colors to the app
  applyTelegramTheme();
  
  // Initialize the authentication process
  initAuth();
  
  // Set up Telegram-specific UI elements
  setupTelegramUI();
});

// Apply Telegram theme to the app
function applyTelegramTheme() {
  const tg = window.Telegram.WebApp;
  const themeParams = tg.themeParams;
  
  // Apply theme colors to CSS variables
  document.documentElement.style.setProperty('--tg-theme-bg-color', themeParams.bg_color);
  document.documentElement.style.setProperty('--tg-theme-text-color', themeParams.text_color);
  document.documentElement.style.setProperty('--tg-theme-hint-color', themeParams.hint_color);
  document.documentElement.style.setProperty('--tg-theme-link-color', themeParams.link_color);
  document.documentElement.style.setProperty('--tg-theme-button-color', themeParams.button_color);
  document.documentElement.style.setProperty('--tg-theme-button-text-color', themeParams.button_text_color);
}

// Set up Telegram-specific UI elements
function setupTelegramUI() {
  const tg = window.Telegram.WebApp;
  
  // Configure the Main Button
  tg.MainButton.setParams({
    text: 'Play Again',
    color: tg.themeParams.button_color,
    text_color: tg.themeParams.button_text_color,
    is_visible: false
  });
  
  // Handle Main Button click
  tg.MainButton.onClick(function() {
    // Reset the game UI
    document.getElementById('player-choice').textContent = '';
    document.getElementById('computer-choice').textContent = '';
    document.getElementById('result-text').textContent = '';
    document.getElementById('result-container').className = 'result-container';
    
    // Hide the Main Button
    tg.MainButton.hide();
  });
  
  // Set up the Back Button if needed
  tg.BackButton.onClick(function() {
    // Handle back button click (e.g., go back to main menu)
    if (document.getElementById('game-history').style.display === 'block') {
      document.getElementById('game-history').style.display = 'none';
      document.getElementById('game-interface').style.display = 'block';
      tg.BackButton.hide();
    }
  });
  
  // Check for CloudStorage API (available in newer versions)
  if (tg.CloudStorage) {
    // You can use Telegram's cloud storage to save user preferences
    tg.CloudStorage.getItem('theme_preference', function(err, value) {
      if (err) {
        console.log('Error getting cloud data', err);
        return;
      }
      
      if (value) {
        // Apply user's saved theme preference
        console.log('User theme preference:', value);
      }
    });
  }
}

// Handle haptic feedback for button presses
function hapticFeedback(type) {
  const tg = window.Telegram.WebApp;
  if (tg.HapticFeedback) {
    switch(type) {
      case 'success':
        tg.HapticFeedback.notificationOccurred('success');
        break;
      case 'error':
        tg.HapticFeedback.notificationOccurred('error');
        break;
      case 'selection':
        tg.HapticFeedback.selectionChanged();
        break;
      case 'impact':
        tg.HapticFeedback.impactOccurred('medium');
        break;
    }
  }
}
```

### 3. Enhanced CSS for Telegram Integration

Create a sleek, modern UI that adapts to Telegram's theme:

```css
/* Base styles with Telegram theming */
:root {
  /* Telegram theme variables - will be set by JavaScript */
  --tg-theme-bg-color: #ffffff;
  --tg-theme-text-color: #000000;
  --tg-theme-hint-color: #999999;
  --tg-theme-link-color: #2481cc;
  --tg-theme-button-color: #2481cc;
  --tg-theme-button-text-color: #ffffff;
  
  /* Game-specific colors */
  --win-color: #4CAF50;
  --lose-color: #F44336;
  --draw-color: #FFC107;
}

/* Reset and base styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: var(--tg-theme-bg-color);
  color: var(--tg-theme-text-color);
  line-height: 1.6;
  padding: 20px;
  max-width: 100%;
  overflow-x: hidden;
}

h1, h2, h3, h4 {
  margin-bottom: 15px;
  text-align: center;
  color: var(--tg-theme-text-color);
}

h1 {
  font-size: 24px;
  margin-top: 10px;
}

h2 {
  font-size: 20px;
  color: var(--tg-theme-link-color);
}

h3 {
  font-size: 18px;
}

p {
  margin-bottom: 15px;
}

button {
  background-color: var(--tg-theme-button-color);
  color: var(--tg-theme-button-text-color);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
  transition: opacity 0.3s;
  display: block;
  width: 100%;
  max-width: 300px;
  margin: 15px auto;
}

button:hover {
  opacity: 0.9;
}

button:active {
  opacity: 0.7;
}

/* Game interface styles */
.choices {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  max-width: 350px;
  margin: 30px auto;
}

.choice-button {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.choice-button:hover {
  transform: scale(1.05);
}

.choice-button:active {
  transform: scale(0.95);
}

.result-container {
  text-align: center;
  margin: 30px auto;
  padding: 20px;
  border-radius: 12px;
  background-color: rgba(0,0,0,0.03);
  max-width: 400px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.result-container.win {
  border: 2px solid var(--win-color);
  background-color: rgba(76, 175, 80, 0.05);
}

.result-container.lose {
  border: 2px solid var(--lose-color);
  background-color: rgba(244, 67, 54, 0.05);
}

.result-container.draw {
  border: 2px solid var(--draw-color);
  background-color: rgba(255, 193, 7, 0.05);
}

.choices-display {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
}

.choice-display {
  font-size: 48px;
  margin: 10px 0;
  animation: bounce 0.5s;
}

#result-text {
  font-size: 24px;
  font-weight: bold;
  margin: 15px 0;
}

.result-container.win #result-text {
  color: var(--win-color);
}

.result-container.lose #result-text {
  color: var(--lose-color);
}

.result-container.draw #result-text {
  color: var(--draw-color);
}

/* Statistics styles */
.stats-container {
  margin: 30px auto;
  padding: 20px;
  border-radius: 12px;
  background-color: rgba(0,0,0,0.03);
  max-width: 400px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.stats-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.stats-row:last-child {
  border-bottom: none;
}

.stats-label {
  color: var(--tg-theme-hint-color);
}

.stats-value {
  font-weight: bold;
}

/* Loading indicator */
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0,0,0,0.1);
  border-radius: 50%;
  border-top-color: var(--tg-theme-button-color);
  margin: 20px auto;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Animations */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
}

.error {
  color: var(--lose-color);
  text-align: center;
  margin: 10px 0;
}

/* Responsive design */
@media (max-width: 480px) {
  .choices {
    max-width: 300px;
  }
  
  .choice-button {
    width: 80px;
    height: 80px;
    font-size: 28px;
  }
  
  .choice-display {
    font-size: 40px;
  }
}
```

## API Endpoints

### Authentication

- `POST /api/auth/telegram/`: Authenticate a user with Telegram data
  - Request: Telegram initData
  - Response: User data and authentication token

### User Profile

- `GET /api/profile/`: Get the user's profile
  - Response: User profile data
- `PUT /api/profile/`: Update the user's profile
  - Request: Updated profile data
  - Response: Updated profile data

### Game

- `POST /api/game/play/`: Play a game
  - Request: User's choice (rock, paper, or scissors)
  - Response: Game result
- `GET /api/game/history/`: Get the user's game history
  - Response: List of games
- `GET /api/game/stats/`: Get the user's game statistics
  - Response: Game statistics

## Testing

### Testing the Backend

1. Run the Django development server:
   ```bash
   cd backend
   python manage.py runserver
   ```

2. Access the Django admin interface at `http://localhost:8000/admin/` to manage users, games, and statistics.

3. Use tools like Postman or curl to test the API endpoints.

### Testing the Frontend

1. Serve the frontend files:
   ```bash
   cd frontend/public
   python -m http.server 8080
   ```

2. Open `http://localhost:8080` in your browser.

3. For testing outside of Telegram, the frontend includes mock data.

### Testing in Telegram

1. Open your bot in Telegram
2. Click the Menu Button to open your Mini App
3. Test the authentication and game functionality

## Troubleshooting

### Common Issues

1. **Authentication Fails**:
   - Ensure your `TELEGRAM_BOT_TOKEN` is correct in `settings.py`
   - Check that the initData is being properly sent to the backend

2. **CORS Errors**:
   - Ensure your backend has CORS properly configured
   - Check that the frontend is making requests to the correct backend URL

3. **Telegram Integration Issues**:
   - Ensure you're using the correct URL for your Mini App in BotFather
   - Check that the Telegram Web App script is properly loaded

### Getting Help

If you encounter issues not covered here, please:
1. Check the Telegram Bot API documentation
2. Check the Django Rest Framework documentation
3. Open an issue in this repository 