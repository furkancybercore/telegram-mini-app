# Rock-Paper-Scissors Telegram Mini App

A simple Rock-Paper-Scissors game built as a Telegram Mini App. This project demonstrates how to create a game that can be embedded directly into Telegram chats.

[Telegram Mini App](https://t.me/RPC_2025_bot/app)

![RPC Game Screenshot](https://github.com/user-attachments/assets/5b937a0b-9690-483f-b478-b0b74d5d9ac8)

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
- **Environment Variables**: Configurable settings for different environments

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
└── docs/                   # Documentation
    ├── BackEnd_explanations.md    # Backend code explanations
    ├── FrontEnd_explanations.md   # Frontend code explanations
    └── POSTMAN_GUIDE.md           # API testing guide
```

## 🚀 Getting Started for Beginners

### Prerequisites

- Python 3.8 or higher
- A modern web browser
- Git (for cloning the repository)
- Telegram account (for full testing)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/telegram-mini-app.git
   cd telegram-mini-app
   ```

2. **Set up the backend**:
   ```bash
   cd backend
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   
   pip install -r requirements.txt
   python manage.py migrate
   ```

3. **Configure your Telegram Bot** (Optional for development):
   - Create a bot through BotFather (https://t.me/BotFather)
   - Get your bot token
   - Add the token to `backend/core/settings.py` as `TELEGRAM_BOT_TOKEN`

### Running the Project Locally

1. **Start the Backend Server**:
   ```bash
   cd telegram-mini-app/backend
   source venv/bin/activate  # Or venv\Scripts\activate on Windows
   python manage.py runserver
   ```
   
   This starts a server at http://localhost:8000

2. **Start the Frontend Server**:
   ```bash
   cd telegram-mini-app/frontend
   python -m http.server 8080
   ```
   
   This serves the frontend at http://localhost:8080

3. **Use the Convenient Scripts** (Alternative method):
   ```bash
   # On Windows
   run.bat
   
   # On macOS/Linux
   ./run.sh
   ```

4. **Open in Browser**:
   Navigate to http://localhost:8080 in your web browser

5. **Development Mode**:
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

4. **Security Considerations**:
   - The validation uses HMAC-SHA256 with the bot token as the secret key
   - Tokens expire after a period of inactivity
   - All authentication data is validated for freshness (< 24 hours old)

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

## 🔧 Environment Configuration

The app supports different environments through configuration:

### Backend Configuration

Create a `.env` file in the backend directory with:

```
DEBUG=True
SECRET_KEY=your_secret_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:8080
```

### Frontend Configuration

The frontend can be configured by modifying the constants in `app.js`:

```javascript
// Edit these values for your setup
const DEFAULT_PRIMARY_API_URL = 'http://localhost:8000/api';
const DEFAULT_FALLBACK_API_URL = 'https://your-api-domain.com/api';
```

## 🛠️ Common Issues and Solutions

### Authentication Problems

- **"Telegram ID is missing"**: Enable Demo Mode to test without Telegram
- **"Invalid authentication data"**: Verify your bot token in settings.py
- **Cannot connect to backend**: Make sure the Django server is running

### Development Workflow

- **Changes not appearing**: Refresh your browser to see CSS/HTML changes
- **Backend errors**: Check the Django server console for error messages
- **Frontend console errors**: Open browser developer tools (F12) to debug

## 🔐 Security Considerations

- **Bot Token Security**: Keep your bot token secret and never commit it to public repositories
- **API Access Control**: The API uses token-based authentication for all protected endpoints
- **Data Validation**: All inputs are validated on both frontend and backend
- **CORS Protection**: Only allowed origins can access the API in production
- **HTTPS Required**: In production, always use HTTPS to secure data transmission
- **Hash Validation**: Telegram authentication includes a hash that must be validated

## 📚 API Documentation

The backend provides these main API endpoints:

### Authentication
- `POST /api/auth/telegram/` - Authenticate with Telegram data
- `GET /api/auth/profile/` - Get authenticated user profile
- `PUT /api/auth/profile/update/` - Update user profile

### Game
- `POST /api/game/play/` - Play a game with choice
- `GET /api/game/history/` - Get user's game history
- `GET /api/game/stats/` - Get user's game statistics

For detailed API documentation, see the [POSTMAN_GUIDE.md](POSTMAN_GUIDE.md) file.

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

If you have any questions or need help, please open an issue in this repository. 
