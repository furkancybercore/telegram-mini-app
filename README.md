# Rock-Paper-Scissors Telegram Mini App

A simple Rock-Paper-Scissors game built as a Telegram Mini App. This project demonstrates how to create a game that can be embedded directly into Telegram chats.

![RPC Game Screenshot](https://via.placeholder.com/600x400?text=Rock+Paper+Scissors+Game)

## 🌟 Project Overview for Beginners

This project is a complete example of a Telegram Mini App - a web application that runs inside the Telegram messenger. It has two main components:

1. **Frontend**: The user interface built with HTML, CSS, and JavaScript
2. **Backend**: A Django server that handles authentication, game logic, and data storage

### ✨ Key Features

- **Telegram Authentication**: Securely log in using your Telegram account
- **Game Mechanics**: Classic Rock-Paper-Scissors game against the computer
- **Stats Tracking**: Records your wins, losses, and draws
- **Responsive Design**: Works on both mobile and desktop Telegram
- **Demo Mode**: Test the app without Telegram integration

## 📁 Project Structure Explained

```
telegram-mini-app/
├── backend/                # Django backend code
│   ├── core/               # Project settings and configuration
│   │   ├── settings.py     # Django settings (database, auth, etc.)
│   │   └── urls.py         # URL routing for the API
│   ├── telegram_auth/      # Telegram authentication module
│   │   ├── models.py       # User data storage
│   │   └── views.py        # Authentication logic
│   └── game/               # Game logic module
│       ├── models.py       # Game data storage
│       └── views.py        # Game mechanics and stats
├── frontend/               # Frontend web application
│   └── public/             # Static files served to browser
│       ├── index.html      # Main HTML structure
│       ├── styles.css      # CSS styles for UI components
│       └── app.js          # JavaScript for UI logic
```

## 🚀 Getting Started for Beginners

### Prerequisites

- Python 3.8 or higher
- A modern web browser
- Basic knowledge of command line

### Running the Project Locally

1. **Start the Backend Server**:
   ```bash
   cd telegram-mini-app/backend
   python manage.py runserver
   ```
   
   This starts a server at http://localhost:8000

2. **Start the Frontend Server**:
   ```bash
   cd telegram-mini-app/frontend
   python -m http.server 8080
   ```
   
   This serves the frontend at http://localhost:8080

3. **Open in Browser**:
   Navigate to http://localhost:8080 in your web browser

4. **Development Mode**:
   Since you're not in Telegram, click "Continue in Demo Mode" to test the app

## 🔑 How Authentication Works

The authentication process follows these steps:

1. **Telegram Provides User Data**: 
   - When opened in Telegram, the app receives encrypted user data
   - This includes user ID, name, username, and profile photo

2. **Frontend Sends Data to Backend**:
   - The app.js code sends this data to our Django backend
   - It properly formats the data based on how it was received

3. **Backend Validates the Data**:
   - The backend checks if the data is authentic using cryptographic verification
   - If valid, it creates or updates the user's account
   - It returns an authentication token for future requests

4. **Demo Mode Alternative**:
   - For development, "Demo Mode" bypasses Telegram authentication
   - It uses mock data to simulate a logged-in user

## 🎮 How the Game Works

1. **User Makes a Choice**:
   - User clicks rock, paper, or scissors button
   - Frontend sends this choice to the backend API

2. **Backend Processes the Game**:
   - Generates a random choice for the computer
   - Determines the winner based on game rules
   - Updates the user's statistics
   - Returns the result to the frontend

3. **Frontend Shows Result**:
   - Displays both the user's and computer's choices
   - Shows who won the round
   - Updates the statistics display

## 🛠️ Common Issues and Solutions

### Authentication Problems

- **"Telegram ID is missing"**: Enable Demo Mode to test without Telegram
- **"Invalid authentication data"**: Verify your bot token in settings.py
- **Cannot connect to backend**: Make sure the Django server is running

### Development Workflow

- **Changes not appearing**: Refresh your browser to see CSS/HTML changes
- **Backend errors**: Check the Django server console for error messages
- **Frontend console errors**: Open browser developer tools (F12) to debug

## 📚 Technical Details for Developers

### Frontend Architecture

The app.js file is organized into these main sections:

1. **Initialization**: Sets up the environment and configuration
2. **Event Listeners**: Handles user interactions
3. **Authentication**: Manages the Telegram login process
4. **Game Logic**: Handles game play and updates
5. **UI Management**: Controls what is shown to the user

### Backend Architecture

The Django backend follows a REST API pattern:

1. **/api/auth/telegram/**: Authenticates users with Telegram data
2. **/api/game/play/**: Processes game moves
3. **/api/game/stats/**: Retrieves user statistics

Each endpoint validates the request, processes the data, and returns a JSON response.

## Recent Updates

### 1. Fixed Stats Display
- Improved error handling for stats fetching
- Added proper validation for missing values
- Fixed authentication token handling

### 2. Enhanced Error Handling
- Added better error messages for common issues
- Improved user feedback during errors
- Fixed issues with error display in the UI

### 3. Code Optimization
- Removed duplicate code
- Added more comments to explain complex parts
- Reorganized functions for better readability

## Security Considerations

- The bot token should be kept secret
- Telegram authentication includes a hash that should be validated
- For production, use HTTPS and proper CORS settings

## Contact

If you have any questions or need help, please open an issue in this repository.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 