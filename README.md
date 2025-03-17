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

1. **User Authentication**:
   - User opens the Telegram Mini App
   - Telegram provides user data via `window.Telegram.WebApp.initData`
   - Frontend sends this data to the backend for validation
   - Backend validates the data using the bot token and creates/updates the user
   - Backend returns a token for subsequent API calls

2. **Game Play**:
   - User selects a choice (rock, paper, or scissors)
   - Frontend sends the choice to the backend
   - Backend generates a random choice for the computer
   - Backend determines the winner and updates the game statistics
   - Backend returns the result to the frontend
   - Frontend displays the result to the user

3. **Game Statistics**:
   - Frontend requests game statistics from the backend
   - Backend returns the user's game statistics
   - Frontend displays the statistics to the user

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

## Telegram Mini App Integration

The frontend integrates with Telegram using the Telegram Web App API. The key integration points are:

1. **Initialization**:
   ```javascript
   const tg = window.Telegram.WebApp;
   tg.expand();
   ```

2. **Theme Adaptation**:
   ```javascript
   document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color);
   document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color);
   // ... more theme properties
   ```

3. **User Authentication**:
   ```javascript
   // Get user data from Telegram
   const initData = tg.initData;
   
   // Send to backend for validation
   fetch('/api/auth/telegram/', {
     method: 'POST',
     body: initData
   });
   ```

4. **Back Button Handling**:
   ```javascript
   tg.BackButton.onClick(() => {
     // Handle back button click
   });
   ```

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