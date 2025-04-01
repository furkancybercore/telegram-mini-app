#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Create staticfiles directory
mkdir -p staticfiles

# Apply database migrations
python manage.py migrate 