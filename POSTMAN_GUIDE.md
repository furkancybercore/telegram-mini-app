# Postman Guide for Telegram Mini App API

This guide will help you test the simplified Telegram Mini App API using Postman. It includes all the basic endpoints for this educational project.

## Table of Contents
1. [Before You Begin](#before-you-begin)
2. [Setting Up Postman](#setting-up-postman)
3. [Creating a Collection](#creating-a-collection)
4. [Authentication Operations](#authentication-operations)
5. [Game Operations](#game-operations)
6. [Advanced Postman Features](#advanced-postman-features)

## Before You Begin

Before testing the API, ensure the Django development server is running:

1. Activate your virtual environment:
   ```bash
   # On macOS/Linux
   source venv/bin/activate
   
   # On Windows
   venv\Scripts\activate
   ```

2. Start the Django development server:
   ```bash
   python manage.py runserver
   ```

3. Verify the server is running by opening http://127.0.0.1:8000/ in your browser.

## Setting Up Postman

1. Download and install Postman from [https://www.postman.com/downloads/](https://www.postman.com/downloads/)
2. Launch Postman and create an account or sign in

## Creating a Collection

1. Click on the "Collections" tab in the sidebar
2. Click the "+" button to create a new collection
3. Name your collection "Telegram Mini App API"
4. Click on the "..." next to your collection name and select "Edit"
5. In the Variables tab, add:
   - `baseUrl`: `http://127.0.0.1:8000` (initial value and current value)
   - `telegram_token`: (leave blank, we'll set this after authentication)
6. Click "Save"

## Authentication Operations

### Authenticate with Telegram (POST)

1. Create a new request in your collection
2. Set the request method to POST
3. Set the URL to `{{baseUrl}}/api/auth/telegram/`
4. Go to the "Body" tab
5. Select "raw" and "JSON" format
6. Enter the following JSON data:
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

9. In the "Tests" tab, add this script to capture the token:
```javascript
var jsonData = pm.response.json();
if (jsonData && jsonData.token) {
    pm.collectionVariables.set("telegram_token", jsonData.token);
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
7. Click "Send"

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
10. Click "Send"

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
10. Click "Send"

### Get Game History (GET)

1. Create a new request in your collection
2. Set the request method to GET
3. Set the URL to `{{baseUrl}}/api/game/history/`
4. Go to the "Headers" tab
5. Add a header:
   - Key: `Authorization`
   - Value: `Token {{telegram_token}}`
6. Save the request as "Get Game History"
7. Click "Send"

### Get Game Statistics (GET)

1. Create a new request in your collection
2. Set the request method to GET
3. Set the URL to `{{baseUrl}}/api/game/stats/`
4. Go to the "Headers" tab
5. Add a header:
   - Key: `Authorization`
   - Value: `Token {{telegram_token}}`
6. Save the request as "Get Game Statistics"
7. Click "Send"

## Advanced Postman Features

### Using Pre-request Scripts

1. Create a new request called "Play Random Game"
2. Set the method to POST and URL to `{{baseUrl}}/api/game/play/`
3. Add the Authorization header
4. Go to the "Scripts" tab and in the "Pre-request" section, add:
```javascript
// Generate random game choice
const choices = ["rock", "paper", "scissors"];
const randomChoice = choices[Math.floor(Math.random() * choices.length)];
pm.collectionVariables.set("randomChoice", randomChoice);
```
5. In the Body tab, add:
```json
{
    "user_choice": "{{randomChoice}}"
}
```
6. Save and run the request

### Creating a Workflow

You can chain requests to create a workflow:

1. Run "Telegram Authentication" to get a token
2. Run "Play Game" multiple times with different choices
3. Run "Get Game Statistics" to see your results

This approach lets you test the entire flow of the application from authentication to gameplay. 