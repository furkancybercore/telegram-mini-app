// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Apply Telegram theme
document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#40a7e3');
document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');

// API Configuration
const API_URL_KEY = 'telegram_mini_app_api_url';
const BOT_USERNAME_KEY = 'telegram_mini_app_bot_username';
const DEMO_MODE_KEY = 'telegram_mini_app_demo_mode';

// Set up API URL
const DEFAULT_API_URL = 'http://localhost:8000';
let API_URL = localStorage.getItem(API_URL_KEY) || DEFAULT_API_URL;
API_URL = API_URL.replace(/\/api\/?$/, '');
if (API_URL.endsWith('/')) {
    API_URL = API_URL.slice(0, -1);
}

// Get configuration
let botUsername = localStorage.getItem(BOT_USERNAME_KEY) || 'RPC_2025_bot';
let demoMode = localStorage.getItem(DEMO_MODE_KEY) === 'true';

// DOM Elements - Auth Section
const authSection = document.getElementById('auth-section');
const gameSection = document.getElementById('game-section');
const profileSection = document.getElementById('profile-section');
const leaderboardSection = document.getElementById('leaderboard-section');
const navbar = document.getElementById('navbar');
const loginButton = document.getElementById('login-button');
const loadingElement = document.getElementById('loading');
const authErrorElement = document.getElementById('auth-error');
const telegramBotInfo = document.getElementById('telegram-bot-info');

// DOM Elements - Game Section
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

// DOM Elements - Profile Section
const profilePhoto = document.getElementById('profile-photo');
const profileName = document.getElementById('profile-name');
const profileUsername = document.getElementById('profile-username');
const profilePhotoEdit = document.querySelector('.profile-photo-edit');
const profilePhotoInput = document.getElementById('profile-photo-input');
const displayNameInput = document.getElementById('display-name');
const emailInput = document.getElementById('email');
const themeButtons = document.querySelectorAll('.theme-button');
const saveProfileButton = document.getElementById('save-profile');
const logoutButton = document.getElementById('logout-button');
const deleteAccountButton = document.getElementById('delete-account');

// DOM Elements - Navigation
const navItems = document.querySelectorAll('.nav-item');

// State
let token = localStorage.getItem('token');
let userData = JSON.parse(localStorage.getItem('userData') || '{}');
let currentSection = 'game-section';
let selectedProfilePhoto = null;

// Initialize the app when the DOM is fully loaded
window.addEventListener('DOMContentLoaded', function() {
    // Set the bot username in the footer
    const botUsernameFooter = document.querySelector('.bot-username-footer');
    if (botUsernameFooter) {
        botUsernameFooter.textContent = `@${botUsername}`;
    }
    
    // Set up event listeners
    loginButton.addEventListener('click', handleLogin);
    
    choiceButtons.forEach(button => {
        button.addEventListener('click', function() {
            const choice = this.dataset.choice;
            handleChoice(choice);
        });
    });
    playAgainButton.addEventListener('click', resetGame);
    
    themeButtons.forEach(button => {
        button.addEventListener('click', () => handleThemeChange(button.id));
    });
    saveProfileButton.addEventListener('click', saveProfile);
    logoutButton.addEventListener('click', handleLogout);
    deleteAccountButton.addEventListener('click', handleDeleteAccount);
    
    // Profile photo edit button
    if (profilePhotoEdit) {
        profilePhotoEdit.addEventListener('click', openProfilePhotoSelector);
    }
    
    // Profile photo input change
    if (profilePhotoInput) {
        profilePhotoInput.addEventListener('change', handleProfilePhotoChange);
    }
    
    navItems.forEach(item => {
        item.addEventListener('click', () => navigateTo(item.dataset.target));
    });
    
    // Initialize app state
    if (token && userData && Object.keys(userData).length > 0) {
        showAuthenticatedUI();
        updateAllUserInfo();
        showSection(currentSection);
        fetchGameStats();
    }
});

/**
 * Handles the login button click
 */
function handleLogin() {
    // Show loading spinner
    loadingElement.classList.remove('hidden');
    authErrorElement.classList.add('hidden');
    telegramBotInfo.classList.add('hidden');
    loginButton.disabled = true;
    
    // Demo mode for testing
    if (demoMode) {
        const mockData = {
            id: '123456789',
            first_name: 'Demo',
            last_name: 'User',
            username: 'demouser',
            photo_url: 'https://via.placeholder.com/150',
            auth_date: Math.floor(Date.now() / 1000),
            hash: 'mock_hash'
        };
        
        setTimeout(() => {
            authenticateWithTelegram(JSON.stringify(mockData));
        }, 1000);
        return;
    }
    
    // Check if we're running within the Telegram app
    if (!window.Telegram || !window.Telegram.WebApp) {
        showLoginError('⚠️ This app must be launched from Telegram. Please scan the QR code with your Telegram app.');
        telegramBotInfo.classList.remove('hidden');
        return;
    }
    
    // If we're in Telegram Mini App, use the data Telegram provides
    if (tg.initData && tg.initData.trim() !== '') {
        authenticateWithTelegram(tg.initData);
    } else {
        showLoginError('Please launch this app properly from your Telegram bot.');
        telegramBotInfo.classList.remove('hidden');
    }
}

function showLoginError(message, isHtml = false) {
    loadingElement.classList.add('hidden');
    loginButton.disabled = false;
    
    if (isHtml) {
        authErrorElement.innerHTML = message;
    } else {
        authErrorElement.textContent = message;
    }
    
    authErrorElement.classList.remove('hidden');
}

/**
 * Authenticates the user with Telegram data
 * 
 * @param {string} initData - The data from Telegram containing user information
 */
async function authenticateWithTelegram(initData) {
    try {
        if (!initData) {
            throw new Error('No authentication data provided');
        }
        
        // Prepare the request data
        let requestBody = initData;
        
        // If it's URL-encoded data from Telegram
        if (initData.includes('=') && initData.includes('&')) {
            const params = new URLSearchParams(initData);
            const dataObject = {};
            
            for (const [key, value] of params.entries()) {
                dataObject[key] = value;
            }
            
            // Check if the user data is nested in a 'user' param
            if (params.has('user')) {
                try {
                    const userData = JSON.parse(params.get('user'));
                    
                    if (userData && userData.id) {
                        dataObject.id = userData.id;
                        dataObject.first_name = userData.first_name || '';
                        dataObject.last_name = userData.last_name || '';
                        dataObject.username = userData.username || '';
                        dataObject.photo_url = userData.photo_url || '';
                    }
                } catch (e) {
                    console.error('Error parsing user data:', e);
                }
            }
            
            // If still no ID but we have user_id, use that
            if (!dataObject.id && params.has('user_id')) {
                dataObject.id = params.get('user_id');
            }
            
            requestBody = JSON.stringify(dataObject);
        }
        
        // Format auth endpoint URL
        const authEndpoint = `${API_URL}/api/auth/telegram/`;
        
        // API call to backend
        const response = await fetch(authEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: requestBody
        });
        
        if (!response.ok) {
            throw new Error(`Authentication failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        token = data.token;
        userData = data.user;
        
        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Update UI
        showAuthenticatedUI();
        updateAllUserInfo();
        showSection('game-section');
        
        // Load game stats after authentication
        setTimeout(() => {
            fetchGameStats();
        }, 500);
    } catch (error) {
        console.error('Authentication error:', error);
        showLoginError('Failed to authenticate. Please try again.');
    }
}

function showAuthenticatedUI() {
    authSection.classList.add('hidden');
    navbar.classList.remove('hidden');
}

/**
 * Updates the UI with all user information
 */
function updateAllUserInfo() {
    // Update game section
    if (userData) {
        userPhoto.src = userData.photo_url || 'https://via.placeholder.com/50';
        userName.textContent = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
    }
    
    // Update profile section
    profilePhoto.src = userData.photo_url || 'https://via.placeholder.com/120';
    profileName.textContent = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
    profileUsername.textContent = userData.username ? `@${userData.username}` : '';
    
    // Prefill profile form with actual first_name and last_name
    document.getElementById('first-name').value = userData.first_name || '';
    document.getElementById('last-name').value = userData.last_name || '';
}

/**
 * Fetches game statistics from the backend API
 */
async function fetchGameStats() {
    try {
        if (!token) {
            return;
        }
        
        const response = await fetch(`${API_URL}/api/game/stats/`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error fetching stats: ${response.status}`);
        }
        
        const stats = await response.json();
        updateStatsDisplay(stats);
    } catch (error) {
        console.error('Error fetching game stats:', error);
    }
}

/**
 * Updates the UI with game statistics
 * @param {Object} stats - The statistics object containing total_games, wins, losses, draws, and win_percentage
 */
function updateStatsDisplay(stats) {
    if (!stats) return;
    
    // Update DOM elements with stats
    totalGamesElement.textContent = stats.total_games || 0;
    winsElement.textContent = stats.wins || 0;
    lossesElement.textContent = stats.losses || 0;
    drawsElement.textContent = stats.draws || 0;
    winRateElement.textContent = `${stats.win_percentage || 0}%`;
}

/**
 * Handles the user's choice (rock, paper, or scissors)
 * @param {string} choice - The user's choice ('rock', 'paper', or 'scissors')
 */
async function handleChoice(choice) {
    try {
        if (!token) {
            alert('Please log in to play the game');
            return;
        }
        
        // Disable buttons during API call
        document.querySelectorAll('.choice-button').forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.7';
        });
        
        const gameUrl = `${API_URL}/api/game/play/`;
        
        const response = await fetch(gameUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ user_choice: choice })
        });
        
        // Re-enable buttons
        document.querySelectorAll('.choice-button').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
        
        if (!response.ok) {
            alert(`Game error: ${response.status} ${response.statusText}`);
            return;
        }
        
        const gameResult = await response.json();
        
        // Update the UI to show the result
        displayResult(gameResult);
        
        // Update stats after a delay
        setTimeout(() => {
            fetchGameStats();
        }, 1000);
    } catch (error) {
        console.error('Game play error:', error);
        alert('There was a problem playing the game. Please try again.');
        
        // Re-enable buttons
        document.querySelectorAll('.choice-button').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
    }
}

/**
 * Displays the result of a game
 * @param {Object} gameResult - The game result object containing user_choice, computer_choice, and result
 */
function displayResult(gameResult) {
    // Show result container
    resultContainer.classList.remove('hidden');
    
    // Hide choice buttons
    document.querySelector('.choices-container').classList.add('hidden');
    
    // Update player and computer choices with emojis
    playerChoiceElement.textContent = getEmojiForChoice(gameResult.user_choice);
    computerChoiceElement.textContent = getEmojiForChoice(gameResult.computer_choice);
    
    // Update result text with appropriate styling
    resultText.className = 'result-text'; // Reset classes
    
    if (gameResult.result === 'win') {
        resultText.textContent = 'You Win! 🎉';
        resultText.classList.add('win-text');
    } else if (gameResult.result === 'lose') {
        resultText.textContent = 'You Lose! 😢';
        resultText.classList.add('lose-text');
    } else {
        resultText.textContent = 'It\'s a Draw! 🤝';
        resultText.classList.add('draw-text');
    }
    
    // Show play again button
    playAgainButton.classList.remove('hidden');
    
    // Scroll to result
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Returns an emoji representation of a game choice
 * @param {string} choice - The choice ('rock', 'paper', or 'scissors')
 * @returns {string} The emoji representing the choice
 */
function getEmojiForChoice(choice) {
    switch (choice) {
        case 'rock': return '✊';
        case 'paper': return '✋';
        case 'scissors': return '✌️';
        default: return '';
    }
}

/**
 * Resets the game UI to allow the user to play again
 */
function resetGame() {
    // Hide result container
    resultContainer.classList.add('hidden');
    
    // Show choice buttons
    document.querySelector('.choices-container').classList.remove('hidden');
    
    // Hide play again button
    playAgainButton.classList.add('hidden');
    
    // Reset result text
    resultText.textContent = '';
    playerChoiceElement.textContent = '';
    computerChoiceElement.textContent = '';
}

// Profile functions
function handleThemeChange(themeId) {
    // Remove active class from all theme buttons
    themeButtons.forEach(button => button.classList.remove('active'));
    
    // Add active class to selected theme button
    document.getElementById(themeId).classList.add('active');
    
    // Implement theme change
    let theme = themeId.replace('-theme', '');
    console.log(`Theme changed to ${theme}`);
}

/**
 * Opens the file selector dialog for profile photo
 */
function openProfilePhotoSelector() {
    // Check if running in Telegram Mini App
    if (window.Telegram && window.Telegram.WebApp) {
        // First try to use Telegram's native photo selector if available
        if (tg.showPopup) {
            tg.showPopup({
                title: 'Select Photo Option',
                message: 'How would you like to update your profile photo?',
                buttons: [
                    {id: 'file', type: 'default', text: 'Select from Device'},
                    {id: 'camera', type: 'default', text: 'Take Photo'},
                    {id: 'cancel', type: 'cancel', text: 'Cancel'}
                ]
            }, function(buttonId) {
                if (buttonId === 'file') {
                    // Create and trigger a hidden file input
                    createAndTriggerFileInput();
                } else if (buttonId === 'camera') {
                    // Not all devices support camera directly, but we can try
                    createAndTriggerFileInput(true);
                }
            });
        } else {
            // Fall back to standard file input if popup not available
            createAndTriggerFileInput();
        }
    } else {
        // Regular web environment
        createAndTriggerFileInput();
    }
}

/**
 * Creates and triggers a file input element
 * @param {boolean} camera - Whether to open the camera
 */
function createAndTriggerFileInput(camera = false) {
    // Check if there's already a file input
    let fileInput = document.getElementById('profile-photo-input');
    
    if (!fileInput) {
        // Create a file input if it doesn't exist
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'profile-photo-input';
        fileInput.accept = 'image/*';
        fileInput.style.position = 'absolute';
        fileInput.style.visibility = 'hidden';
        fileInput.style.pointerEvents = 'none';
        document.body.appendChild(fileInput);
        
        // Add change event listener
        fileInput.addEventListener('change', handleProfilePhotoChange);
    }
    
    // Open camera if requested and supported
    if (camera) {
        fileInput.setAttribute('capture', 'user');
    } else {
        fileInput.removeAttribute('capture');
    }
    
    // Trigger click
    fileInput.click();
}

/**
 * Handles the selected profile photo
 * @param {Event} event - The change event
 */
function handleProfilePhotoChange(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match('image.*')) {
        showProfileUpdateStatus('Please select an image file (JPEG, PNG, etc.)', false);
        return;
    }
    
    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
        showProfileUpdateStatus('Image is too large. Please select an image smaller than 5MB.', false);
        return;
    }
    
    // Store the selected file for upload
    selectedProfilePhoto = file;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        // Update the profile photo with the selected image preview
        profilePhoto.src = e.target.result;
        
        // Show a badge or indicator that changes are not saved
        showProfileUpdateStatus('Photo selected. Click "Save Changes" to update your profile.', true, 'info');
    };
    reader.readAsDataURL(file);
}

/**
 * Shows a status message in the profile section
 * @param {string} message - The message to display
 * @param {boolean} isSuccess - Whether it's a success message
 * @param {string} type - The type of message ('success', 'error', 'info')
 */
function showProfileUpdateStatus(message, isSuccess = true, type = null) {
    const profileStatus = document.getElementById('profile-status');
    const profileStatusMessage = profileStatus.querySelector('.profile-status-message');
    
    // Remove all classes first
    profileStatus.classList.remove('hidden', 'success', 'error', 'info');
    
    // Add appropriate class
    if (type) {
        profileStatus.classList.add(type);
    } else {
        profileStatus.classList.add(isSuccess ? 'success' : 'error');
    }
    
    profileStatusMessage.textContent = message;
    
    // Auto-hide after a delay unless it's an info message
    if (type !== 'info') {
        setTimeout(() => {
            profileStatus.classList.add('hidden');
        }, 3000);
    }
}

/**
 * Saves profile changes to the backend API
 */
async function saveProfile() {
    // Show loading indicator or disable button
    saveProfileButton.disabled = true;
    saveProfileButton.innerHTML = '<div class="spinner" style="width:20px;height:20px;margin-right:8px;"></div> Saving...';
    
    // Get the profile status element
    const profileStatus = document.getElementById('profile-status');
    const profileStatusMessage = profileStatus.querySelector('.profile-status-message');
    
    try {
        // Make sure we have a token
        if (!token) {
            throw new Error('You must be logged in to update your profile');
        }
        
        // Get updated profile information from the form
        const updatedProfile = {
            first_name: document.getElementById('first-name').value,
            last_name: document.getElementById('last-name').value
        };
        
        // Format update profile endpoint URL
        const updateProfileEndpoint = `${API_URL}/api/auth/profile/update/`;
        
        // If we have a new profile photo to upload
        if (selectedProfilePhoto) {
            // Create FormData to handle file upload
            const formData = new FormData();
            formData.append('photo', selectedProfilePhoto);
            formData.append('first_name', updatedProfile.first_name);
            formData.append('last_name', updatedProfile.last_name);
            
            // Make API call to upload photo and update profile
            const response = await fetch(updateProfileEndpoint, {
                method: 'PUT',
                headers: {
                    'Authorization': `Token ${token}`,
                    // Don't set Content-Type here - FormData will set it correctly with the boundary
                },
                body: formData
            });
            
            // Handle response
            if (!response.ok) {
                throw new Error(`Failed to update profile: ${response.status} ${response.statusText}`);
            }
            
            // Parse response data
            const data = await response.json();
            
            // Update userData with the updated profile
            userData = data;
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // Clear the selected photo since it's been uploaded
            selectedProfilePhoto = null;
            
            // Show success message
            showProfileUpdateStatus('Profile and photo updated successfully!', true);
        } else {
            // Just update profile without photo
            const response = await fetch(updateProfileEndpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(updatedProfile)
            });
            
            // Handle response
            if (!response.ok) {
                throw new Error(`Failed to update profile: ${response.status} ${response.statusText}`);
            }
            
            // Parse response data
            const data = await response.json();
            
            // Update userData with the updated profile
            userData = data;
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // Show success message
            showProfileUpdateStatus('Profile updated successfully!', true);
        }
        
        // Update UI with new data
        updateAllUserInfo();
        
    } catch (error) {
        // Show error message
        showProfileUpdateStatus(error.message || 'Failed to update profile. Please try again.', false);
        console.error('Error updating profile:', error);
    } finally {
        // Re-enable save button
        saveProfileButton.disabled = false;
        saveProfileButton.innerHTML = '<span class="button-icon">💾</span>Save Changes';
    }
}

function handleLogout() {
    // Confirm logout
    if (confirm('Are you sure you want to logout?')) {
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        
        // Reset state
        token = null;
        userData = {};
        
        // Show auth section
        authSection.classList.remove('hidden');
        navbar.classList.add('hidden');
        gameSection.classList.add('hidden');
        profileSection.classList.add('hidden');
        leaderboardSection.classList.add('hidden');
        
        // Reset login button
        loginButton.disabled = false;
    }
}

function handleDeleteAccount() {
    // Confirm delete
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        if (confirm('Really delete your account? All your data will be lost.')) {
            // In a real app, we would send a request to delete the account
            
            // Handle logout
            handleLogout();
        }
    }
}

// Navigation functions
function navigateTo(sectionId) {
    currentSection = sectionId;
    showSection(sectionId);
    
    // Update active nav item
    navItems.forEach(item => {
        if (item.dataset.target === sectionId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Handle back button visibility
    if (sectionId === 'game-section') {
        tg.BackButton.hide();
        
        // Refresh stats when navigating to the game section
        if (token) {
            fetchGameStats();
        }
    } else {
        tg.BackButton.show();
    }
}

function showSection(sectionId) {
    // Hide all sections
    authSection.classList.add('hidden');
    gameSection.classList.add('hidden');
    profileSection.classList.add('hidden');
    leaderboardSection.classList.add('hidden');
    
    // Show selected section
    document.getElementById(sectionId).classList.remove('hidden');
}

// Handle Telegram back button
tg.BackButton.onClick(() => {
    if (currentSection !== 'game-section') {
        navigateTo('game-section');
    } else if (!resultContainer.classList.contains('hidden')) {
        resetGame();
    } else if (!authSection.classList.contains('hidden')) {
        tg.close();
    }
}); 