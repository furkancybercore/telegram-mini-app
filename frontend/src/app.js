// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Apply Telegram theme
document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#40a7e3');
document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');

// API URL - replace with your actual backend URL
const API_URL = 'https://a8b0-203-30-15-108.ngrok-free.app/api';

// DOM Elements
const authSection = document.getElementById('auth-section');
const gameSection = document.getElementById('game-section');
const loginButton = document.getElementById('login-button');
const userPhoto = document.getElementById('user-photo');
const userName = document.getElementById('user-name');
const choiceButtons = document.querySelectorAll('.choice-button');
const resultContainer = document.getElementById('result-container');
const playerChoiceElement = document.getElementById('player-choice');
const computerChoiceElement = document.getElementById('computer-choice');
const resultText = document.getElementById('result-text');
const playAgainButton = document.getElementById('play-again');
const totalGamesElement = document.getElementById('total-games');
const winsElement = document.getElementById('wins');
const lossesElement = document.getElementById('losses');
const drawsElement = document.getElementById('draws');
const winRateElement = document.getElementById('win-rate');

// State
let token = localStorage.getItem('token');
let userData = JSON.parse(localStorage.getItem('userData'));

// Check if user is already authenticated
if (token && userData) {
    showGameSection();
    updateUserInfo();
    fetchGameStats();
}

// Event Listeners
loginButton.addEventListener('click', handleLogin);
choiceButtons.forEach(button => {
    button.addEventListener('click', () => handleChoice(button.dataset.choice));
});
playAgainButton.addEventListener('click', resetGame);

// Functions
function handleLogin() {
    // If we're in Telegram Mini App, use initData
    if (tg.initData) {
        authenticateWithTelegram(tg.initData);
    } else {
        // For testing in browser
        console.log('Not in Telegram Mini App. Using mock data.');
        const mockData = {
            id: '123456789',
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser',
            photo_url: 'https://via.placeholder.com/50',
            auth_date: Math.floor(Date.now() / 1000),
            hash: 'mock_hash'
        };
        authenticateWithTelegram(JSON.stringify(mockData));
    }
}

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

function showGameSection() {
    authSection.classList.add('hidden');
    gameSection.classList.remove('hidden');
}

function updateUserInfo() {
    if (userData) {
        userPhoto.src = userData.photo_url || 'https://via.placeholder.com/50';
        userName.textContent = `Welcome, ${userData.first_name} ${userData.last_name || ''}!`;
    }
}

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

function getEmojiForChoice(choice) {
    switch (choice) {
        case 'rock': return '✊';
        case 'paper': return '✋';
        case 'scissors': return '✌️';
        default: return '';
    }
}

function resetGame() {
    resultContainer.classList.add('hidden');
    document.querySelector('.choices').classList.remove('hidden');
}

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