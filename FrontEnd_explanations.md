# Frontend Code Flow Explanation

This document explains the frontend implementation of our Telegram Mini App, focusing on how the code works and the flow of operations from user actions to server communications. We'll explore the core files that power the frontend functionality: `app.js` and `serve.py`.

## Table of Contents
- [Frontend Code Flow Explanation](#frontend-code-flow-explanation)
  - [Table of Contents](#table-of-contents)
  - [1. app.js - The Frontend Application Logic](#1-appjs---the-frontend-application-logic)
    - [Initialization](#initialization)
    - [DOM Elements and State](#dom-elements-and-state)
    - [Authentication Flow](#authentication-flow)
    - [Game Play Flow](#game-play-flow)
    - [Statistics and UI Updates](#statistics-and-ui-updates)
    - [Telegram Integration](#telegram-integration)
  - [2. serve.py - The Frontend Development Server](#2-servepy---the-frontend-development-server)
    - [Server Configuration](#server-configuration)
    - [CORS Handling](#cors-handling)
    - [Server Execution](#server-execution)

## 1. app.js - The Frontend Application Logic

The `app.js` file is the heart of our Telegram Mini App's frontend. It handles user interactions, authentication, gameplay, and integration with Telegram's Web App features.

### Initialization

When the page loads, the first code to execute initializes the Telegram Web App and applies Telegram's theme colors:

```javascript
// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Apply Telegram theme
document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#40a7e3');
document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
```

Here's what happens:
1. `window.Telegram.WebApp` is accessed to get the Telegram Web App object
2. `tg.expand()` expands the Web App to take the full screen within Telegram
3. CSS custom properties are set based on Telegram's theme colors, or fallback to defaults if not available
   - This allows the app to perfectly match Telegram's light/dark theme setting

### DOM Elements and State

Next, the app grabs references to DOM elements and initializes state variables:

```javascript
// DOM Elements
const authSection = document.getElementById('auth-section');
const gameSection = document.getElementById('game-section');
const loginButton = document.getElementById('login-button');
// ...more element references...

// State
let token = localStorage.getItem('token');
let userData = JSON.parse(localStorage.getItem('userData'));

// Check if user is already authenticated
if (token && userData) {
    showGameSection();
    updateUserInfo();
    fetchGameStats();
}
```

This code does several things:
1. Gets references to HTML elements needed for interaction
2. Retrieves saved authentication data from browser's localStorage (if present)
3. Checks if the user is already authenticated
   - If authenticated, displays the game section and loads user data and statistics
   - If not, the auth section remains visible and the user will need to log in

### Authentication Flow

The authentication flow is triggered when the user clicks the login button:

```javascript
loginButton.addEventListener('click', handleLogin);

function handleLogin() {
    // If we're in Telegram Mini App, use initData
    if (tg.initData) {
        authenticateWithTelegram(tg.initData);
    } else {
        // For testing in browser
        console.log('Not in Telegram Mini App. Using mock data.');
        const mockData = {
            // Mock user data for testing
            id: '123456789',
            first_name: 'Test',
            // ...more mock fields...
        };
        authenticateWithTelegram(JSON.stringify(mockData));
    }
}
```

When the login button is clicked:
1. The app checks if it's running inside the actual Telegram app by checking for `tg.initData`
2. If running in Telegram, it uses the real authentication data provided by Telegram
3. If running in a regular browser (for development/testing), it uses mock data

The authentication function then makes a POST request to the backend:

```javascript
async function authenticateWithTelegram(initData) {
    try {
        const response = await fetch(`${API_URL}/auth/telegram/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: initData
        });

        if (!response.ok) {
            throw new Error('Authentication failed');
        }

        const data = await response.json();
        token = data.token;
        userData = data.user;

        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(userData));

        // Update UI
        showGameSection();
        updateUserInfo();
        fetchGameStats();
    } catch (error) {
        console.error('Authentication error:', error);
        alert('Failed to authenticate with Telegram. Please try again.');
    }
}
```

Here's what happens during authentication:
1. The function makes a POST request to the backend with the Telegram initData
2. The backend verifies the data and returns:
   - A token for future authenticated requests
   - The user data
3. This data is saved to localStorage for persistence
4. The UI is updated to show the game section, user information, and game statistics

### Game Play Flow

The game flow begins when a user selects rock, paper, or scissors:

```javascript
choiceButtons.forEach(button => {
    button.addEventListener('click', () => handleChoice(button.dataset.choice));
});

async function handleChoice(choice) {
    try {
        const response = await fetch(`${API_URL}/game/play/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify({ user_choice: choice })
        });

        if (!response.ok) {
            throw new Error('Game play failed');
        }

        const gameResult = await response.json();
        displayResult(gameResult);
        fetchGameStats(); // Update stats after game
    } catch (error) {
        console.error('Error playing game:', error);
        alert('Failed to play the game. Please try again.');
    }
}
```

The game play flow:
1. When a choice button is clicked, the `handleChoice` function is called with the chosen option
2. A POST request is sent to the backend's `/game/play/` endpoint with:
   - The user's choice
   - The auth token in the Authorization header
3. The backend processes the game (generates computer choice, determines winner, etc.)
4. The response contains the game result
5. The result is displayed in the UI
6. Game statistics are refreshed to show the updated values

The result display function then updates the UI:

```javascript
function displayResult(gameResult) {
    // Show result container
    resultContainer.classList.remove('hidden');
    
    // Hide choice buttons
    document.querySelector('.choices').classList.add('hidden');
    
    // Update result display
    playerChoiceElement.textContent = getEmojiForChoice(gameResult.user_choice);
    computerChoiceElement.textContent = getEmojiForChoice(gameResult.computer_choice);
    
    // Set result text
    if (gameResult.result === 'win') {
        resultText.textContent = 'You Win! 🎉';
    } else if (gameResult.result === 'lose') {
        resultText.textContent = 'You Lose! 😢';
    } else {
        resultText.textContent = 'It\'s a Draw! 🤝';
    }
}
```

This function:
1. Shows the result container and hides the choice buttons
2. Converts the text choices (rock/paper/scissors) to emoji using the helper function
3. Sets appropriate result text based on win/lose/draw outcome

### Statistics and UI Updates

After each game, the statistics are updated:

```javascript
async function fetchGameStats() {
    try {
        const response = await fetch(`${API_URL}/game/stats/`, {
            headers: {
                'Authorization': `Token ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch game stats');
        }

        const stats = await response.json();
        updateStatsDisplay(stats);
    } catch (error) {
        console.error('Error fetching game stats:', error);
    }
}

function updateStatsDisplay(stats) {
    totalGamesElement.textContent = stats.total_games;
    winsElement.textContent = stats.wins;
    lossesElement.textContent = stats.losses;
    drawsElement.textContent = stats.draws;
    winRateElement.textContent = `${stats.win_percentage}%`;
}
```

This code:
1. Sends a GET request to the `/game/stats/` endpoint with the user's token
2. Updates the UI with the fetched statistics
3. Handles errors if the stats can't be fetched

### Telegram Integration

The application also integrates with Telegram-specific features like the back button:

```javascript
// Handle Telegram back button
tg.BackButton.onClick(() => {
    if (!authSection.classList.contains('hidden')) {
        tg.close();
    } else if (!resultContainer.classList.contains('hidden')) {
        resetGame();
    } else {
        authSection.classList.remove('hidden');
        gameSection.classList.add('hidden');
    }
});

// Show back button when appropriate
window.addEventListener('load', () => {
    if (token && userData) {
        tg.BackButton.show();
    }
});
```

This code:
1. Sets up a handler for Telegram's back button
2. Implements context-aware behavior:
   - If on the auth screen: close the mini app
   - If viewing game results: reset the game to play again
   - If on the game screen: go back to auth screen
3. Shows the back button only when authenticated

## 2. serve.py - The Frontend Development Server

The `serve.py` file is a simple Python HTTP server used for local development of the frontend.

### Server Configuration

The server is configured to serve the frontend files and handle CORS:

```python
#!/usr/bin/env python3
"""
Simple HTTP server for serving the frontend files.
"""

import http.server
import socketserver
import os
import sys

PORT = 8080

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()
```

This code:
1. Defines a custom HTTP request handler class that extends the standard SimpleHTTPRequestHandler
2. Sets the port to 8080, which is typical for development servers
3. Adds CORS headers to all responses, allowing requests from any origin
4. Implements an OPTIONS method handler to support CORS preflight requests

### CORS Handling

CORS (Cross-Origin Resource Sharing) headers are critical because:
1. During development, the frontend is served from one port (8080), while the backend is served from another port (typically 8000)
2. Without CORS headers, the browser would block the frontend from making requests to the backend due to the same-origin policy
3. The `Access-Control-Allow-Origin: *` header allows requests from any domain
4. The `Access-Control-Allow-Methods` header specifies which HTTP methods are allowed (GET, POST, OPTIONS)
5. The `Access-Control-Allow-Headers` header specifies which custom headers are allowed (Content-Type)

### Server Execution

The server execution logic is straightforward:

```python
def run_server():
    # Change to the directory containing the script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Create the server
    handler = MyHTTPRequestHandler
    httpd = socketserver.TCPServer(("", PORT), handler)
    
    print(f"Serving at http://localhost:{PORT}")
    print("Press Ctrl+C to stop the server")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped")
        httpd.server_close()
        sys.exit(0)

if __name__ == "__main__":
    run_server()
```

This code:
1. Defines a `run_server` function that:
   - Changes the current directory to where the script is located, ensuring files are served from the right location
   - Creates a TCP server using the custom handler on the specified port
   - Prints a helpful message showing the URL and how to stop the server
   - Starts the server in an infinite loop using `serve_forever()`
   - Catches KeyboardInterrupt (Ctrl+C) to gracefully shut down the server
2. Calls `run_server()` if the script is run directly

When executed, this script serves the frontend files from the current directory, making them accessible at `http://localhost:8080`. 