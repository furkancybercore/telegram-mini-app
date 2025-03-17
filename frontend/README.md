# 🎮 Rock-Paper-Scissors Frontend

This is the frontend web application for the Rock-Paper-Scissors Telegram Mini App. It provides a user interface for playing the game, viewing statistics, and managing your profile.

## 🌟 Overview for Beginners

The frontend is a web application built with:
- **HTML**: Defines the structure and content
- **CSS**: Controls the styling and appearance
- **JavaScript**: Handles user interactions and logic

When someone opens our Mini App in Telegram, they see this frontend interface which communicates with our backend API to provide the game experience.

## 📁 Project Structure Explained

```
frontend/
├── public/              # Files served to the browser
│   ├── index.html       # Main HTML structure
│   ├── app.js           # JavaScript application code
│   └── styles.css       # CSS styling rules
└── serve.py             # Helper script to run a local server
```

### Key Files Explained

1. **index.html**
   - Defines the page structure with different sections:
     - Authentication section (login)
     - Game interface (rock/paper/scissors buttons)
     - Results display
     - Statistics panel
     - Profile settings

2. **styles.css**
   - Controls how everything looks:
     - Colors and themes
     - Layout and positioning
     - Animations and visual effects
     - Responsive design for different screen sizes

3. **app.js**
   - Makes everything interactive:
     - Authenticates with Telegram
     - Sends game choices to the backend
     - Updates the UI based on results
     - Tracks and displays statistics
     - Manages navigation between sections

## 🚀 Running the Frontend Locally

### Option 1: Using Python's Built-in Server

```bash
# Navigate to the frontend directory
cd frontend

# Start a web server on port 8080
python -m http.server 8080
```

### Option 2: Using the Included Script

```bash
# Navigate to the frontend directory
cd frontend

# Run the server script
python serve.py
```

Once running, you can access the application at:
**http://localhost:8080**

## 🧪 Testing Without Telegram

Since the app is designed to run inside Telegram, you'll need to use Demo Mode for local testing:

1. Open the app in your browser: http://localhost:8080
2. You'll see an error about not being in Telegram
3. Click the "Continue in Demo Mode" button
4. The app will simulate a Telegram user for testing

Alternatively, use the Developer Tools:
1. Click "Developer Tools" at the bottom of the login page
2. Click "Toggle Demo Mode" to enable demo mode
3. Click "Login with Telegram" again

## 💻 Key Code Concepts Explained

### 1. Telegram Web App Integration

The app initializes the Telegram Web App integration:

```javascript
// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Apply Telegram theme
document.documentElement.style.setProperty('--tg-theme-bg-color', 
    tg.themeParams.bg_color || '#ffffff');
```

### 2. Authentication Flow

The app handles authentication with Telegram:

```javascript
// When login button is clicked
loginButton.addEventListener('click', handleLogin);

// Authentication function
function handleLogin() {
    // Check if we're in Telegram
    if (tg.initData && tg.initData.trim() !== '') {
        // Send Telegram data to our backend
        authenticateWithTelegram(tg.initData);
    } else {
        // Show error or demo option
        showLoginError("Not in Telegram environment");
    }
}
```

### 3. Game Mechanics

The core game logic for handling user choices:

```javascript
// When a choice button is clicked
choiceButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Send the choice to the backend
        handleChoice(button.dataset.choice);
    });
});

// Process the game result
function displayResult(gameResult) {
    // Show who chose what
    playerChoiceElement.textContent = getEmojiForChoice(gameResult.user_choice);
    computerChoiceElement.textContent = getEmojiForChoice(gameResult.computer_choice);
    
    // Show the outcome
    if (gameResult.result === 'win') {
        resultText.textContent = 'You Win! 🎉';
    } else if (gameResult.result === 'lose') {
        resultText.textContent = 'You Lose! 😢';
    } else {
        resultText.textContent = 'It\'s a Draw! 🤝';
    }
}
```

## 🎨 Customization Options

### Changing the UI Theme

The app automatically picks up Telegram's theme colors, but you can customize them:

1. In `styles.css`, modify the CSS variables:
   ```css
   :root {
       --tg-theme-bg-color: #ffffff;
       --tg-theme-text-color: #000000;
       --tg-theme-button-color: #40a7e3;
       --tg-theme-button-text-color: #ffffff;
   }
   ```

### Changing Game Elements

To customize the game interface:

1. For different choice buttons, edit the HTML:
   ```html
   <div class="choices-container">
       <button class="choice-button" data-choice="rock">
           <span class="choice-emoji">✊</span>
           <span class="choice-label">Rock</span>
       </button>
       <!-- Add more choices here -->
   </div>
   ```

## 🐛 Troubleshooting Common Issues

### 1. "Cannot Connect to Server"
- Make sure the backend server is running
- Check that the API URL is correct in the app.js file
- Verify that you're accessing the correct frontend URL

### 2. "Telegram ID is Missing"
- This occurs when running outside Telegram without demo mode
- Click "Continue in Demo Mode" or enable demo mode in developer tools

### 3. UI Looks Different than Expected
- Try clearing your browser cache
- Check if you're using a supported browser (Chrome, Firefox, Safari)
- Inspect any CSS errors in browser developer tools

## 🔍 Advanced Development

### Browser Developer Tools

For debugging, use your browser's developer tools:
1. Press F12 or right-click and select "Inspect"
2. Check the "Console" tab for JavaScript logs and errors
3. Use the "Network" tab to monitor API requests
4. Use the "Elements" tab to inspect the HTML structure

### Local Storage

The app uses browser localStorage to persist data:
```javascript
// Save token and user data
localStorage.setItem('token', token);
localStorage.setItem('userData', JSON.stringify(userData));

// Retrieve token and user data
let token = localStorage.getItem('token');
let userData = JSON.parse(localStorage.getItem('userData') || '{}');
```

You can clear this data from developer tools or by clicking "Clear Storage" in the app's developer tools panel.

## License

This project is licensed under the MIT License. 