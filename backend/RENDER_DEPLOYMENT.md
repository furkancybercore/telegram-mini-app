# Deploying to Render

This document provides instructions for deploying the Rock-Paper-Scissors Telegram Mini App backend to Render.

## Prerequisites

- A Render account (https://render.com/)
- A GitHub repository containing your project code
- Your Telegram Bot Token

## Deployment Steps

### 1. Push Your Code to GitHub

Ensure all your changes are committed and pushed to your GitHub repository.

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Create a New Web Service on Render

1. Log in to your Render account
2. Click on "New" and select "Web Service"
3. Connect your GitHub repository
4. Configure your web service with the following settings:

   - **Name**: rpc-game-backend (or your preferred name)
   - **Environment**: Python
   - **Region**: Choose the region closest to your users
   - **Branch**: main (or your default branch)
   - **Build Command**: `cd backend && chmod +x build.sh && ./build.sh`
   - **Start Command**: `cd backend && gunicorn core.wsgi:application`

### 3. Configure Environment Variables

Add the following environment variables in the Render dashboard:

- `DEBUG`: False
- `SECRET_KEY`: (Generate a secure random key)
- `TELEGRAM_BOT_TOKEN`: (Your Telegram Bot Token)
- `ALLOWED_HOSTS`: .onrender.com,localhost,127.0.0.1
- `CORS_ALLOWED_ORIGINS`: https://t.me (Add more origins as needed)

### 4. (Optional) Set Up a PostgreSQL Database

1. In the Render dashboard, go to "New" and select "PostgreSQL"
2. Create a new PostgreSQL database
3. After creation, copy the Internal Database URL
4. Add it to your web service as an environment variable named `DATABASE_URL`

### 5. Deploy Your Service

1. Click "Create Web Service"
2. Wait for the deployment to complete (this may take a few minutes)
3. Once deployed, you can access your API at the URL provided by Render

### 6. Update Your Bot Configuration

1. Update your Telegram Bot webhook URL to point to your new Render URL
2. Update your Telegram Mini App configuration to use the new API endpoint

## Monitoring and Maintenance

- You can view logs from the Render dashboard
- Render will automatically redeploy when you push changes to your GitHub repository
- For troubleshooting, check the logs in the Render dashboard

## Free Tier Limitations

- The free tier will spin down after 15 minutes of inactivity
- The first request after inactivity will take a bit longer (cold start)
- Free tier includes 750 hours of runtime per month 