# Telegram Mini App Backend

A simplified Django REST Framework backend for a Telegram Mini App. This is designed as an educational project to demonstrate basic concepts of building backends for Telegram Mini Apps.

## Features

- **Telegram Authentication**: Simple implementation of Telegram authentication flow
- **Rock-Paper-Scissors Game**: Basic game logic with user and computer choices
- **User Statistics**: Track games played, wins, losses, and draws

## Project Structure

The project is structured into two main apps:

1. **telegram_auth**: Handles user authentication via Telegram
   - User profile management
   - Token generation for API access

2. **game**: Implements the rock-paper-scissors game
   - Game play logic
   - Game history tracking
   - User statistics

## Getting Started

### Prerequisites

- Python 3.8 or higher
- Django 4.2 or higher
- Django REST Framework 3.14 or higher

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/telegram-mini-app.git
cd telegram-mini-app/backend
```

2. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Apply migrations:

```bash
python manage.py migrate
```

5. Start the development server:

```bash
python manage.py runserver
```

## API Endpoints

### Authentication

- `POST /api/auth/telegram/`: Authenticate with Telegram data
- `GET /api/auth/profile/`: Get user profile
- `PUT /api/auth/profile/update/`: Update user profile

### Game

- `POST /api/game/play/`: Play a game of rock-paper-scissors
- `GET /api/game/history/`: Get user's game history
- `GET /api/game/stats/`: Get user's game statistics

## Documentation

- See the [BackEnd_explanations.md](BackEnd_explanations.md) file for detailed code explanations
- See the [POSTMAN_GUIDE.md](POSTMAN_GUIDE.md) file for API testing instructions

## Simplified Implementation Notes

This backend has been intentionally simplified for educational purposes:

- Error handling is minimal
- Authentication checks are straightforward
- Database transactions are handled directly without decorators
- Code structure focuses on core functionality

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
