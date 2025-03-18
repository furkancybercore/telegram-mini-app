# Postman Guide for Telegram Mini App API

This guide will help you test the Telegram Mini App API using Postman, a powerful API development and testing tool. It includes all the implemented endpoints and detailed instructions for testing them.

## Table of Contents
1. [Before You Begin](#before-you-begin)
2. [Setting Up Postman](#setting-up-postman)
3. [Creating a Collection](#creating-a-collection)
4. [Authentication Operations](#authentication-operations)
5. [Game Operations](#game-operations)
6. [Advanced Postman Features](#advanced-postman-features)
7. [Automated Testing](#automated-testing)
8. [Environment Variables](#environment-variables)
9. [Request Chaining](#request-chaining)
10. [Troubleshooting](#troubleshooting)

## Before You Begin

Before you can test the API, you need to ensure the Django development server is running:

1. Activate your virtual environment:
   ```bash
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

2. Start the Django development server:
   ```bash
   python manage.py runserver
   ```

3. Verify the server is running by opening http://127.0.0.1:8000/ in your browser. You should see a response from the API.

**Important**: If you're getting "Error: connect ECONNREFUSED 127.0.0.1:8000" in Postman, it means the server is not running. Make sure to complete the steps above before testing with Postman.

## Setting Up Postman

1. Download and install Postman from [https://www.postman.com/downloads/](https://www.postman.com/downloads/)
2. Launch Postman and create an account or sign in

## Creating a Collection

Collections in Postman help you organize related requests for easier management and testing.

1. Click on the "Collections" tab in the sidebar
2. Click the "+" button to create a new collection
3. Name your collection "Telegram Mini App API"
4. Click on the "..." next to your collection name and select "Edit"
5. In the Variables tab, add these collection variables:
   - `baseUrl`: `http://127.0.0.1:8000` (initial value and current value)
   - `telegram_token`: (leave blank, we'll set this after authentication)
6. Click "Save" to save your collection settings

## Authentication Operations

### Authenticate with Telegram (POST)

This endpoint authenticates a user based on Telegram data and returns a token.

1. Create a new request in your collection
2. Set the request method to POST
3. Set the URL to `{{baseUrl}}/api/auth/telegram/`
4. Go to the "Body" tab
5. Select "raw" and "JSON" format
6. Enter the following JSON data (mock data for testing):
```json
{
    "id": "123456789",
    "first_name": "John",
    "last_name": "Doe",
    "username": "johndoe",
    "photo_url": "https://t.me/i/userpic/320/johndoe.jpg",
    "auth_date": "1617346200",
    "hash": "mock_hash"
}
```
7. Save the request as "Telegram Authentication"
8. Click "Send" to execute the request

**Expected Response:**
```json
{
    "token": "9c5f1bb7a8c5f1bb7a8c5f1bb7a8c5f1bb7a8c5f",
    "user": {
        "id": 1,
        "user": {
            "id": 1,
            "username": "johndoe",
            "email": ""
        },
        "telegram_id": 123456789,
        "username": "johndoe",
        "first_name": "John",
        "last_name": "Doe",
        "photo_url": "https://t.me/i/userpic/320/johndoe.jpg",
        "auth_date": 1617346200
    }
}
```

9. After receiving the response, click on the "Tests" tab and add this script to capture the token:
```javascript
var jsonData = pm.response.json();
if (jsonData && jsonData.token) {
    pm.collectionVariables.set("telegram_token", jsonData.token);
    console.log("Token saved: " + jsonData.token);
}
```

### Get User Profile (GET)

1. Create a new request in your collection
2. Set the request method to GET
3. Set the URL to `{{baseUrl}}/api/auth/profile/`
4. Go to the "Headers" tab
5. Add a header:
   - Key: `Authorization`
   - Value: `Token {{telegram_token}}`
6. Save the request as "Get User Profile"
7. Click "Send" to execute the request

**Expected Response:**
```json
{
    "id": 1,
    "user": {
        "id": 1,
        "username": "johndoe",
        "email": ""
    },
    "telegram_id": 123456789,
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe",
    "photo_url": "https://t.me/i/userpic/320/johndoe.jpg",
    "auth_date": 1617346200
}
```

### Update User Profile (PUT)

1. Create a new request in your collection
2. Set the request method to PUT
3. Set the URL to `{{baseUrl}}/api/auth/profile/update/`
4. Go to the "Headers" tab
5. Add a header:
   - Key: `Authorization`
   - Value: `Token {{telegram_token}}`
6. Go to the "Body" tab
7. Select "raw" and "JSON" format
8. Enter the following JSON data:
```json
{
    "first_name": "John Updated",
    "last_name": "Doe Updated"
}
```
9. Save the request as "Update User Profile"
10. Click "Send" to execute the request

**Expected Response:**
```json
{
    "id": 1,
    "user": {
        "id": 1,
        "username": "johndoe",
        "email": ""
    },
    "telegram_id": 123456789,
    "username": "johndoe",
    "first_name": "John Updated",
    "last_name": "Doe Updated",
    "photo_url": "https://t.me/i/userpic/320/johndoe.jpg",
    "auth_date": 1617346200
}
```

## Game Operations

### Play Game (POST)

1. Create a new request in your collection
2. Set the request method to POST
3. Set the URL to `{{baseUrl}}/api/game/play/`
4. Go to the "Headers" tab
5. Add a header:
   - Key: `Authorization`
   - Value: `Token {{telegram_token}}`
6. Go to the "Body" tab
7. Select "raw" and "JSON" format
8. Enter the following JSON data:
```json
{
    "user_choice": "rock"
}
```
9. Save the request as "Play Game"
10. Click "Send" to execute the request

**Expected Response:**
```json
{
    "id": 1,
    "user": 1,
    "user_choice": "rock",
    "computer_choice": "scissors",
    "result": "win",
    "status": "completed",
    "created_at": "2023-03-18T10:25:30.123456Z",
    "updated_at": "2023-03-18T10:25:30.123456Z"
}
```

### Get Game History (GET)

1. Create a new request in your collection
2. Set the request method to GET
3. Set the URL to `{{baseUrl}}/api/game/history/`
4. Go to the "Headers" tab
5. Add a header:
   - Key: `Authorization`
   - Value: `Token {{telegram_token}}`
6. Save the request as "Get Game History"
7. Click "Send" to execute the request

**Expected Response:**
```json
[
    {
        "id": 1,
        "user": 1,
        "user_choice": "rock",
        "computer_choice": "scissors",
        "result": "win",
        "status": "completed",
        "created_at": "2023-03-18T10:25:30.123456Z",
        "updated_at": "2023-03-18T10:25:30.123456Z"
    },
    {
        "id": 2,
        "user": 1,
        "user_choice": "paper",
        "computer_choice": "rock",
        "result": "win",
        "status": "completed",
        "created_at": "2023-03-18T10:30:15.123456Z",
        "updated_at": "2023-03-18T10:30:15.123456Z"
    }
]
```

### Get Game Statistics (GET)

1. Create a new request in your collection
2. Set the request method to GET
3. Set the URL to `{{baseUrl}}/api/game/stats/`
4. Go to the "Headers" tab
5. Add a header:
   - Key: `Authorization`
   - Value: `Token {{telegram_token}}`
6. Save the request as "Get Game Statistics"
7. Click "Send" to execute the request

**Expected Response:**
```json
{
    "id": 1,
    "user": 1,
    "total_games": 2,
    "wins": 2,
    "losses": 0,
    "draws": 0,
    "win_percentage": 100.0
}
```

## Advanced Postman Features

### Using Pre-request Scripts

Pre-request scripts run before a request is sent, allowing you to set up the environment or manipulate data.

1. Create a new request called "Play Random Game"
2. Set the method to POST and URL to `{{baseUrl}}/api/game/play/`
3. Add the Authorization header as in previous examples
4. Go to the "Scripts" tab and in the "Pre-request" section, add:
```javascript
// Generate random game choice
const choices = ["rock", "paper", "scissors"];
const randomChoice = choices[Math.floor(Math.random() * choices.length)];

// Set as environment variable
pm.collectionVariables.set("randomChoice", randomChoice);

console.log(`Selected random choice: ${randomChoice}`);
```
5. In the Body tab, add:
```json
{
    "user_choice": "{{randomChoice}}"
}
```
6. Save and run the request

### Working with Response Data

Create a request to show how to parse and use response data:

1. Create a new request called "Parse Game Stats"
2. Set the method to GET and URL to `{{baseUrl}}/api/game/stats/`
3. Add the Authorization header as in previous examples
4. Go to the "Scripts" tab and in the "Post-response" section, add:
```javascript
// Parse the response
var jsonData = pm.response.json();

// Calculate and log win rate
pm.test("Calculate win rate", function() {
    var winRate = jsonData.wins / jsonData.total_games * 100;
    console.log(`Win rate: ${winRate.toFixed(2)}%`);
    
    // Store stats in variables for later use
    pm.collectionVariables.set("totalGames", jsonData.total_games);
    pm.collectionVariables.set("userWins", jsonData.wins);
    pm.collectionVariables.set("userLosses", jsonData.losses);
    pm.collectionVariables.set("userDraws", jsonData.draws);
});

// Check if user is on a winning streak
pm.test("Check winning streak", function() {
    if (jsonData.wins > jsonData.losses + jsonData.draws) {
        console.log("User is on a winning streak!");
    } else if (jsonData.losses > jsonData.wins + jsonData.draws) {
        console.log("User is on a losing streak!");
    } else {
        console.log("User has mixed results.");
    }
});
```
5. Save and run the request

## Automated Testing

Postman allows you to create automated test suites to validate your API endpoints.

### Create a Test Suite

1. In your Telegram Mini App API collection, click on the "..." menu
2. Select "Add folder" and name it "Test Suite"
3. Inside this folder, create several test requests:

#### Test Authentication Validation

1. Create a request named "Test - Invalid Authentication"
2. Set method to POST and URL to `{{baseUrl}}/api/auth/telegram/`
3. In Body, add invalid data:
```json
{
    "id": "123456789",
    "auth_date": "1617346200"
}
```
4. Go to the "Scripts" tab and in the "Post-response" section, add:
```javascript
pm.test("Status should be 400 Bad Request", function() {
    pm.response.to.have.status(400);
});

pm.test("Should return validation error about missing hash", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('error');
    pm.expect(jsonData.error).to.include('hash is missing');
});
```

#### Test Authentication Success

1. Create a request named "Test - Valid Authentication"
2. Set method to POST and URL to `{{baseUrl}}/api/auth/telegram/`
3. In Body, add valid mock data:
```json
{
    "id": "123456789",
    "first_name": "John",
    "last_name": "Doe",
    "username": "johndoe",
    "photo_url": "https://t.me/i/userpic/320/johndoe.jpg",
    "auth_date": "1617346200",
    "hash": "mock_hash"
}
```
4. Go to the "Scripts" tab and in the "Post-response" section, add:
```javascript
pm.test("Status code is 200", function() {
    pm.response.to.have.status(200);
});

pm.test("Authentication returns token", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('token');
    pm.expect(jsonData.token).to.not.be.empty;
    
    // Save token for subsequent tests
    if (jsonData.token) {
        pm.collectionVariables.set("telegram_token", jsonData.token);
    }
});

pm.test("Response contains user data", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('user');
    pm.expect(jsonData.user).to.have.property('telegram_id');
    pm.expect(jsonData.user.telegram_id.toString()).to.eql('123456789');
});
```

#### Test Profile Access

1. Create a request named "Test - Profile Access"
2. Set method to GET and URL to `{{baseUrl}}/api/auth/profile/`
3. Add the Authorization header with the token
4. Go to the "Scripts" tab and in the "Post-response" section, add:
```javascript
pm.test("Status code is 200", function() {
    pm.response.to.have.status(200);
});

pm.test("Profile data is correct", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('telegram_id');
    pm.expect(jsonData).to.have.property('first_name');
    pm.expect(jsonData).to.have.property('username');
});
```

#### Test Game Play

1. Create a request named "Test - Game Play"
2. Set method to POST and URL to `{{baseUrl}}/api/game/play/`
3. Add the Authorization header with the token
4. In Body, add:
```json
{
    "user_choice": "rock"
}
```
5. Go to the "Scripts" tab and in the "Post-response" section, add:
```javascript
pm.test("Status code is 200", function() {
    pm.response.to.have.status(200);
});

pm.test("Game data is correct", function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('user_choice');
    pm.expect(jsonData).to.have.property('computer_choice');
    pm.expect(jsonData).to.have.property('result');
    pm.expect(jsonData.user_choice).to.eql('rock');
    pm.expect(['win', 'lose', 'draw']).to.include(jsonData.result);
});
```

### Running Collection Tests

1. Click on the collection name
2. Click the "Run" button
3. Select the requests you want to run
4. Click "Run Telegram Mini App API"
5. View the test results

## Environment Variables

Environments in Postman allow you to run the same collection against different servers (e.g., development, staging, production).

### Create Environments

1. Click on "Environments" in the left sidebar
2. Click the "+" button to create a new environment
3. Name it "Development"
4. Add these variables:
   - `baseUrl`: `http://127.0.0.1:8000` 
   - `telegram_token`: (leave blank, will be filled during testing)
5. Save the environment

6. Create another environment named "Production" (hypothetical for practice)
7. Add these variables:
   - `baseUrl`: `https://api.your-telegram-app.com` (hypothetical address)
   - `telegram_token`: (leave blank, will be filled during testing)
8. Save the environment

9. In your requests, update URLs to use both variables:
   - Change URLs to use `{{baseUrl}}/api/...` format

10. Switch between environments using the dropdown in the upper right corner

## Request Chaining

You can chain requests together to create workflows. Example: Authenticate → Get Profile → Play Game → Get Stats

### Create an Authentication and Game Play Chain

1. Create a folder named "Workflows"
2. Inside, create a request named "01 - Authenticate"
3. Set up authentication with mock data (as described earlier)
4. Go to the "Scripts" tab and in the "Post-response" section, add:
```javascript
var jsonData = pm.response.json();
if (jsonData && jsonData.token) {
    pm.collectionVariables.set("telegram_token", jsonData.token);
    console.log("Authentication successful, token saved.");
}
```

5. Create another request named "02 - Play Game"
6. Add the Authorization header with the token
7. In Body, add:
```json
{
    "user_choice": "rock"
}
```
8. In the "Scripts" tab under "Post-response", add:
```javascript
var jsonData = pm.response.json();
console.log("Game played, result: " + jsonData.result);
pm.collectionVariables.set("gameResult", jsonData.result);
```

9. Create a third request named "03 - Get Statistics"
10. Add the Authorization header with the token
11. In the "Scripts" tab under "Post-response", add:
```javascript
var jsonData = pm.response.json();
console.log("Total games: " + jsonData.total_games);
console.log("Wins: " + jsonData.wins);
console.log("Losses: " + jsonData.losses);
console.log("Draws: " + jsonData.draws);
console.log("Win percentage: " + jsonData.win_percentage + "%");
```

### Use a Collection Runner to Execute the Workflow

1. Click the collection
2. Click "Run"
3. Select only the Workflows folder
4. Ensure "Keep variable values" is checked
5. Run the workflow

## Troubleshooting

### Common Issues

1. **"Error: connect ECONNREFUSED 127.0.0.1:8000"**:
   - Make sure the Django development server is running
   - Check that you're using the correct URL (http://127.0.0.1:8000/)
   - Ensure no firewall is blocking the connection

2. **"401 Unauthorized"**:
   - Check that your token is valid and correctly included in the Authorization header
   - Tokens expire after some time; try re-authenticating
   - Verify the header format is exactly: `Token your_token_here`

3. **"400 Bad Request"**:
   - Check your request body for correct JSON format
   - Ensure all required fields are provided
   - For game play, verify that `user_choice` is one of: "rock", "paper", "scissors"

4. **"500 Internal Server Error"**:
   - Check the Django server console for error messages
   - This usually indicates a problem with the server-side code 

### Debugging with Postman

Use these Postman features to debug issues:

1. **Console**: View the Postman console (View > Show Postman Console) to see detailed request and response data, including headers

2. **Request History**: Postman keeps a history of all requests you've sent. View it by clicking on "History" in the sidebar

3. **Save Examples**: When a request works correctly, save it as an example for future reference by clicking "Save Response" and then "Save as Example"

4. **Request Timing**: Postman shows timing information for requests, which can help identify performance issues

5. **Network Status**: If you're having connection issues, check your network status in the bottom right corner of Postman 