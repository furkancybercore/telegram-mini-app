// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Apply Telegram theme
document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#40a7e3');
document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');

// Constants
const API_URL_KEY = 'telegram_mini_app_api_url';
const BOT_USERNAME_KEY = 'telegram_mini_app_bot_username';
const DEMO_MODE_KEY = 'telegram_mini_app_demo_mode';

// API URLs - primary and fallback
const DEFAULT_PRIMARY_API_URL = 'http://localhost:8000/api';
const DEFAULT_FALLBACK_API_URL = 'https://a8b0-203-30-15-108.ngrok-free.app/api';
const LOCAL_DEVELOPMENT = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Get stored values or use defaults
let PRIMARY_API_URL = localStorage.getItem(API_URL_KEY) || DEFAULT_PRIMARY_API_URL;
let FALLBACK_API_URL = DEFAULT_FALLBACK_API_URL;
let API_URL = LOCAL_DEVELOPMENT ? DEFAULT_PRIMARY_API_URL : (localStorage.getItem(API_URL_KEY) || DEFAULT_PRIMARY_API_URL);
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
let apiUrlTested = false;

// Additional DOM elements
const botQrCode = document.getElementById('bot-qr-code');
const botTelegramLink = document.getElementById('bot-telegram-link');
const showDevToolsBtn = document.getElementById('show-dev-tools-btn');
const devToolsPanel = document.getElementById('dev-tools-panel');
const botUsernameInput = document.getElementById('bot-username-input');
const updateBotBtn = document.getElementById('update-bot-btn');
const apiUrlInput = document.getElementById('api-url-input');
const updateApiBtn = document.getElementById('update-api-btn');
const clearStorageBtn = document.getElementById('clear-storage-btn');
const toggleDemoModeBtn = document.getElementById('toggle-demo-mode-btn');

// Initialize developer tools
initDevTools();

// Event listeners for developer tools
if (showDevToolsBtn) {
    showDevToolsBtn.addEventListener('click', toggleDevToolsPanel);
}

if (updateBotBtn) {
    updateBotBtn.addEventListener('click', () => {
        const newUsername = botUsernameInput.value.trim().replace('@', '');
        if (newUsername) {
            updateBotUsername(newUsername);
            alert(`Bot username updated to: @${newUsername}`);
        }
    });
}

if (updateApiBtn) {
    updateApiBtn.addEventListener('click', () => {
        const newApiUrl = apiUrlInput.value.trim();
        if (newApiUrl) {
            localStorage.setItem(API_URL_KEY, newApiUrl);
            PRIMARY_API_URL = newApiUrl;
            API_URL = PRIMARY_API_URL;
            alert(`API URL updated to: ${newApiUrl}\nRefresh the page to apply changes.`);
        }
    });
}

if (clearStorageBtn) {
    clearStorageBtn.addEventListener('click', () => {
        if (confirm('This will clear all saved data. Continue?')) {
            localStorage.clear();
            alert('Storage cleared. Refreshing page...');
            window.location.reload();
        }
    });
}

if (toggleDemoModeBtn) {
    toggleDemoModeBtn.addEventListener('click', () => {
        demoMode = !demoMode;
        localStorage.setItem(DEMO_MODE_KEY, demoMode);
        toggleDemoModeBtn.textContent = demoMode ? 'Disable Demo Mode' : 'Enable Demo Mode';
        alert(`Demo mode is now ${demoMode ? 'enabled' : 'disabled'}. Refreshing page...`);
        window.location.reload();
    });
}

// Functions for developer tools
function initDevTools() {
    // Set the bot username from localStorage or the default
    updateBotUsername(botUsername);
    
    // Initialize inputs
    if (botUsernameInput) {
        botUsernameInput.value = botUsername;
    }
    
    if (apiUrlInput) {
        apiUrlInput.value = PRIMARY_API_URL;
    }
    
    if (toggleDemoModeBtn) {
        toggleDemoModeBtn.textContent = demoMode ? 'Disable Demo Mode' : 'Enable Demo Mode';
    }
}

function toggleDevToolsPanel() {
    if (devToolsPanel) {
        devToolsPanel.classList.toggle('hidden');
        showDevToolsBtn.textContent = devToolsPanel.classList.contains('hidden') 
            ? '🔧 Developer Tools' 
            : '❌ Close Developer Tools';
    }
}

function updateBotUsername(username) {
    botUsername = username;
    
    // Update QR code
    if (botQrCode) {
        botQrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://t.me/${username}`;
    }
    
    // Update Telegram link
    if (botTelegramLink) {
        botTelegramLink.href = `https://t.me/${username}`;
        // Preserve the icon in the link
        botTelegramLink.innerHTML = `<i class="fab fa-telegram"></i> Open @${username} in Telegram`;
    }
    
    // Save to localStorage
    localStorage.setItem(BOT_USERNAME_KEY, username);
}

// Check if we should use the fallback URL immediately in local development
if (LOCAL_DEVELOPMENT) {
    console.log('Using local API URL:', API_URL);
}

// These will now be handled by the DOMContentLoaded event
// checkApiHealth();
// updateBotUsername(botUsername);

// Check if user is already authenticated
function initializeApp() {
    if (token && userData && Object.keys(userData).length > 0) {
        showAuthenticatedUI();
        updateAllUserInfo();
        showSection(currentSection);
        fetchGameStats();
    }
}

// Test the API health
async function checkApiHealth() {
    if (apiUrlTested) return;
    
    try {
        console.log('Testing API connection to:', API_URL);
        const startTime = Date.now();
        
        // First try with no-cors to just check if the server is reachable
        try {
            const preflightCheck = await fetch(`${API_URL}/health-check/`, { 
                method: 'HEAD',
                mode: 'no-cors'  // This will at least tell us if the server is up
            });
            console.log('Server appears to be up (no-cors check)');
        } catch (preflightError) {
            console.error('Server is unreachable:', preflightError);
            throw new Error('Server is unreachable');
        }
        
        // Now try the actual API endpoint
        const response = await fetch(`${API_URL}/auth/telegram/`, {
            method: 'HEAD',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const endTime = Date.now();
        
        // Even a 404 or 405 is okay, it means the server is up
        if (response.status === 200 || response.status === 404 || response.status === 405) {
            console.log(`API is reachable! Status: ${response.status}, Response time: ${endTime - startTime}ms`);
            apiUrlTested = true;
            initializeApp();
            return;
        } else {
            console.warn(`Primary API returned unexpected status: ${response.status}, switching to fallback`);
            switchToFallbackApi();
        }
    } catch (error) {
        console.error('Error connecting to API:', error);
        switchToFallbackApi();
    }
}

function switchToFallbackApi() {
    if (API_URL === FALLBACK_API_URL) {
        console.error('Fallback API also failed. Please check server status.');
        authErrorElement.textContent = 'Server unavailable. Please try again later.';
        authErrorElement.classList.remove('hidden');
        loadingElement.classList.add('hidden');
        loginButton.disabled = false;
        return;
    }
    
    API_URL = FALLBACK_API_URL;
    console.log('Switched to fallback API:', API_URL);
    apiUrlTested = true;
    initializeApp();
}

// Event Listeners - Auth
loginButton.addEventListener('click', handleLogin);

// Event Listeners - Game
choiceButtons.forEach(button => {
    button.addEventListener('click', () => handleChoice(button.dataset.choice));
});
playAgainButton.addEventListener('click', resetGame);

// Event Listeners - Profile
themeButtons.forEach(button => {
    button.addEventListener('click', () => handleThemeChange(button.id));
});
saveProfileButton.addEventListener('click', saveProfile);
logoutButton.addEventListener('click', handleLogout);
deleteAccountButton.addEventListener('click', handleDeleteAccount);

// Event Listeners - Navigation
navItems.forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.target));
});

// Functions - Authentication
function handleLogin() {
    // Show loading and hide error
    loadingElement.classList.remove('hidden');
    authErrorElement.classList.add('hidden');
    telegramBotInfo.classList.add('hidden');
    loginButton.disabled = true;

    // Check if demo mode is enabled
    if (demoMode) {
        console.log('Demo mode is enabled. Using mock data.');
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
            // Always stringify the mockData object
            const jsonData = JSON.stringify(mockData);
            console.log('Mock data (stringified):', jsonData);
            authenticateWithTelegram(jsonData);
        }, 1000); // Simulate network delay
        return;
    }

    // Check if running within Telegram environment
    if (!window.Telegram || !window.Telegram.WebApp) {
        showTelegramRequiredError();
        return;
    }

    // If we're in Telegram Mini App, use initData
    if (tg.initData && tg.initData.trim() !== '') {
        console.log('Using Telegram initData for authentication');
        // The initData is already a URL-encoded string, so we use it directly
        authenticateWithTelegram(tg.initData);
    } else {
        // For cases where the app is opened in Telegram but without proper initData
        if (window.Telegram && window.Telegram.WebApp) {
            showTelegramBotError();
        } else {
            // For testing in browser
            console.log('Not in Telegram Mini App. Using mock data.');
            
            const mockData = {
                id: '123456789',
                first_name: 'Test',
                last_name: 'User',
                username: 'testuser',
                photo_url: 'https://via.placeholder.com/150',
                auth_date: Math.floor(Date.now() / 1000),
                hash: 'mock_hash'
            };
            
            // Show option to continue in demo mode
            showLoginError(`Not launched from Telegram. <button id="demo-mode-btn" class="demo-button">Continue in Demo Mode</button>`, true);
            telegramBotInfo.classList.remove('hidden');
            
            // Add event listener for demo mode button
            const demoBtn = document.getElementById('demo-mode-btn');
            if (demoBtn) {
                demoBtn.addEventListener('click', () => {
                    loadingElement.classList.remove('hidden');
                    authErrorElement.classList.add('hidden');
                    telegramBotInfo.classList.add('hidden');
                    setTimeout(() => {
                        // Always stringify the mockData object
                        const jsonData = JSON.stringify(mockData);
                        console.log('Mock data (stringified):', jsonData);
                        authenticateWithTelegram(jsonData);
                    }, 1000); // Simulate network delay
                });
            }
        }
    }
}

function showTelegramRequiredError() {
    showLoginError('⚠️ This app must be launched from Telegram. Please scan the QR code with your Telegram app or click the link below.', true);
    telegramBotInfo.classList.remove('hidden');
    
    // Add a hint about demo mode
    const demoModeHint = document.createElement('p');
    demoModeHint.className = 'auth-hint';
    demoModeHint.innerHTML = 'Want to test the app? Enable <strong>Demo Mode</strong> in the developer tools below.';
    authErrorElement.parentNode.insertBefore(demoModeHint, telegramBotInfo);
}

function showTelegramBotError() {
    showLoginError(`Please launch this app properly from your Telegram bot.<br><br>
        <strong>Instructions:</strong><br>
        1. Open your Telegram app<br>
        2. Search for your bot<br>
        3. Start the bot if you haven't already<br>
        4. Click on the Menu button in the bot chat`, true);
    telegramBotInfo.classList.remove('hidden');
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

async function authenticateWithTelegram(initData) {
    try {
        console.log('Authenticating with API:', API_URL);
        
        // Log initData info for debugging (safely)
        if (initData && typeof initData === 'string') {
            const preview = initData.length > 20 ? initData.substring(0, 20) + '...' : initData;
            console.log('initData preview:', preview, 'length:', initData.length);
        } else {
            console.error('Invalid initData format:', typeof initData);
            throw new Error('Invalid authentication data format');
        }
        
        // Check for browser compatibility issues
        if (typeof fetch !== 'function') {
            throw new Error('Your browser does not support modern features required by this app');
        }
        
        // Prepare the request data
        let requestBody;
        let contentType = 'application/json';
        
        // Handle different types of initData
        if (initData.startsWith('{') && initData.endsWith('}')) {
            // Already a JSON string, use as is
            requestBody = initData;
            console.log('Using JSON string as request body');
        } else if (initData.includes('=') && initData.includes('&')) {
            // It's URL-encoded data from Telegram
            // Convert to JSON format for the backend
            console.log('Converting URL-encoded data to JSON');
            const params = new URLSearchParams(initData);
            const dataObject = {};
            
            for (const [key, value] of params.entries()) {
                dataObject[key] = value;
            }
            
            // Check if the user data is nested in a 'user' param
            if (params.has('user')) {
                try {
                    // Parse the user object from the URLSearchParams
                    const userData = JSON.parse(params.get('user'));
                    console.log('Found user data:', userData);
                    
                    // Extract user ID and details
                    if (userData && userData.id) {
                        dataObject.id = userData.id;
                        dataObject.first_name = userData.first_name || '';
                        dataObject.last_name = userData.last_name || '';
                        dataObject.username = userData.username || '';
                        dataObject.photo_url = userData.photo_url || '';
                        console.log('Extracted user ID:', dataObject.id);
                    } else {
                        console.warn('User data found but no ID present');
                    }
                } catch (e) {
                    console.error('Error parsing user data:', e);
                }
            }
            
            // If still no ID but we have user_id, use that
            if (!dataObject.id && params.has('user_id')) {
                dataObject.id = params.get('user_id');
                console.log('Using user_id as ID:', dataObject.id);
            }
            
            requestBody = JSON.stringify(dataObject);
            console.log('Converted data:', requestBody.substring(0, 100) + '...');
        } else {
            // Try to use as is, assuming it might be valid JSON
            requestBody = initData;
            console.log('Using initData as-is');
        }
        
        // Check if we have the required ID field before sending
        let hasID = false;
        try {
            const parsedBody = typeof requestBody === 'string' ? JSON.parse(requestBody) : requestBody;
            hasID = !!(parsedBody && parsedBody.id);
            if (!hasID) {
                console.error('Missing required ID in request data');
                throw new Error('Missing Telegram user ID');
            }
        } catch (e) {
            if (e.message === 'Missing Telegram user ID') {
                // If ID is missing, offer to switch to demo mode
                showLoginError(`Telegram ID is missing. <button id="enable-demo-mode-btn" class="demo-button">Continue in Demo Mode</button>`, true);
                telegramBotInfo.classList.remove('hidden');
                loadingElement.classList.add('hidden');
                loginButton.disabled = false;
                
                // Add event listener for demo mode button
                const demoBtn = document.getElementById('enable-demo-mode-btn');
                if (demoBtn) {
                    demoBtn.addEventListener('click', () => {
                        // Enable demo mode
                        demoMode = true;
                        localStorage.setItem(DEMO_MODE_KEY, 'true');
                        console.log('Demo mode enabled automatically due to missing ID');
                        
                        // Restart login process
                        handleLogin();
                    });
                }
                return; // Exit the function
            }
            console.warn('Could not verify ID presence:', e);
        }
        
        // API call to backend
        console.log(`Sending request to ${API_URL}/auth/telegram/`);
        const response = await fetch(`${API_URL}/auth/telegram/`, {
            method: 'POST',
            headers: {
                'Content-Type': contentType,
                'Accept': 'application/json'
            },
            body: requestBody
        });

        console.log('Response status:', response.status, response.statusText);
        
        // Handle different error scenarios
        if (!response.ok) {
            let errorMessage = '';
            try {
                // Check if there's content to parse
                const text = await response.text();
                console.log('Error response text:', text.substring(0, 200));
                
                if (text && text.trim()) {
                    try {
                        const errorJson = JSON.parse(text);
                        errorMessage = errorJson.error || errorJson.detail || errorJson.message || '';
                    } catch (jsonError) {
                        errorMessage = text;
                    }
                } else {
                    errorMessage = `Empty response with status: ${response.status} ${response.statusText}`;
                }
            } catch (e) {
                errorMessage = `Status: ${response.status} ${response.statusText}`;
            }
            
            console.error('Backend error response:', errorMessage);
            throw new Error(`Authentication failed: ${errorMessage}`);
        }

        // Check if there's content to parse
        const responseText = await response.text();
        console.log('Response text length:', responseText.length);
        
        if (!responseText || !responseText.trim()) {
            throw new Error('Server returned an empty response');
        }
        
        // Parse the response
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('Successfully parsed response JSON');
        } catch (e) {
            console.error('JSON parse error:', e, 'for text:', responseText.substring(0, 100));
            throw new Error('Invalid JSON response from server');
        }
        
        // Validate response data
        if (!data || !data.token) {
            console.error('Invalid response data:', data);
            throw new Error('Invalid response from server (missing token)');
        }
        
        token = data.token;
        userData = data.user;

        console.log('Authentication successful!');
        
        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(userData));

        // Update UI
        showAuthenticatedUI();
        updateAllUserInfo();
        showSection('game-section');
        fetchGameStats();
    } catch (error) {
        console.error('Authentication error:', error);
        
        // Show error message
        let errorMessage = 'Failed to authenticate. Please try again.';
        
        if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            errorMessage = 'Cannot connect to server. Please check your internet connection.';
            
            // Try fallback API if this was the primary
            if (API_URL !== FALLBACK_API_URL) {
                switchToFallbackApi();
                handleLogin(); // Try login again with the new API URL
                return;
            }
        } else if (error.message.includes('Invalid authentication data')) {
            errorMessage = 'Invalid Telegram authentication data. Please restart the app from Telegram.';
        } else if (error.message.includes('Server returned an empty response')) {
            errorMessage = 'Server returned an empty response. Please try again later.';
        } else if (error.message.includes('Invalid JSON response')) {
            errorMessage = 'Server returned invalid data format. Please try again later.';
        } else if (error.message.includes('Invalid response')) {
            errorMessage = 'Server returned invalid data. Please try again later.';
        } else if (error.message.includes('JSON parse error')) {
            errorMessage = 'JSON parsing error. Please try again later.';
        } else if (error.message.includes('Authentication failed:')) {
            // Extract the specific error message
            errorMessage = error.message.replace('Authentication failed: ', '');
            if (errorMessage.includes('hash')) {
                errorMessage = 'Invalid authentication data from Telegram. Please try again.';
            }
        }
        
        showLoginError(errorMessage);
    }
}

function showAuthenticatedUI() {
    authSection.classList.add('hidden');
    navbar.classList.remove('hidden');
}

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
    
    // Prefill profile form
    displayNameInput.value = userData.display_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
    emailInput.value = userData.email || '';
}

// Functions - Game Play
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
    totalGamesElement.textContent = stats.total_games || 0;
    winsElement.textContent = stats.wins || 0;
    lossesElement.textContent = stats.losses || 0;
    drawsElement.textContent = stats.draws || 0;
    winRateElement.textContent = `${stats.win_percentage || 0}%`;
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
    document.querySelector('.choices-container').classList.add('hidden');
    
    // Update result display
    playerChoiceElement.textContent = getEmojiForChoice(gameResult.user_choice);
    computerChoiceElement.textContent = getEmojiForChoice(gameResult.computer_choice);
    
    // Set result text
    if (gameResult.result === 'win') {
        resultText.textContent = 'You Win! 🎉';
        resultText.style.color = 'var(--win-color)';
    } else if (gameResult.result === 'lose') {
        resultText.textContent = 'You Lose! 😢';
        resultText.style.color = 'var(--lose-color)';
    } else {
        resultText.textContent = 'It\'s a Draw! 🤝';
        resultText.style.color = 'var(--draw-color)';
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
    document.querySelector('.choices-container').classList.remove('hidden');
}

// Functions - Profile
function handleThemeChange(themeId) {
    // Remove active class from all theme buttons
    themeButtons.forEach(button => button.classList.remove('active'));
    
    // Add active class to selected theme button
    document.getElementById(themeId).classList.add('active');
    
    // Implement theme change
    let theme = themeId.replace('-theme', '');
    console.log(`Theme changed to ${theme}`);
    
    // In a real app, we would save this preference to the backend
}

async function saveProfile() {
    try {
        // In a real app, we would send this data to the backend
        const updatedProfile = {
            display_name: displayNameInput.value,
            email: emailInput.value
        };
        
        console.log('Profile updated:', updatedProfile);
        
        // Update local userData
        userData = {
            ...userData,
            ...updatedProfile
        };
        
        // Save to localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Show success message
        alert('Profile updated successfully!');
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
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
            console.log('Account deleted');
            
            // Handle logout
            handleLogout();
        }
    }
}

// Functions - Navigation
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

// Show back button when appropriate
window.addEventListener('load', () => {
    if (token && userData && Object.keys(userData).length > 0 && currentSection !== 'game-section') {
        tg.BackButton.show();
    }
});

// Check for Telegram WebApp initialization
function checkTelegramWebApp() {
    if (!window.Telegram || !window.Telegram.WebApp) {
        console.error('Telegram WebApp not found');
        handleTelegramAuthError('⚠️ This app must be launched from Telegram. Please open this Mini App from your Telegram bot.');
        return false;
    }
    return true;
}

// Function to handle Telegram authentication errors
function handleTelegramAuthError(message) {
    showLoginError(message, true);
    telegramBotInfo.classList.remove('hidden');
}

// Initialize the app
window.addEventListener('DOMContentLoaded', function() {
    // Set the bot username in all places where it might be displayed
    const botUsernameFooter = document.querySelector('.bot-username-footer');
    if (botUsernameFooter) {
        botUsernameFooter.textContent = `@${botUsername}`;
    }
    
    // Check API health before proceeding
    checkApiHealth();
    
    // Set the bot username from localStorage or the default
    updateBotUsername(botUsername);
}); 