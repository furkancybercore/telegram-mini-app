"""
Django Views for Telegram Mini App Game API.

This file contains function-based views handling API endpoints for game operations.
The views interact with the database models and use serializers to process request and response data.

API Endpoints:
- `GET /api/game/play/` → Retrieves the user's game history.
- `POST /api/game/play/` → Plays a new game and returns the result.
- `GET /api/game/stats/` → Retrieves the user's game statistics.
"""
from django.shortcuts import render
import random
from django.db import transaction
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from .models import Game, GameStats
from .serializers import GameSerializer, GameStatsSerializer


# Game History API
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_game_history(request):
    """
    Get user's game history.
    
    Returns:
        - 200 OK: Returns a list of the user's previous games, ordered by creation date (newest first)
    """
    games = Game.objects.filter(user=request.user).order_by('-created_at')
    serializer = GameSerializer(games, many=True)
    return Response(serializer.data)


# Play Game API
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def play_game(request):
    """
    Play a game of rock-paper-scissors.
    
    Request Body:
        - user_choice (str): Player's choice ('rock', 'paper', or 'scissors')
        
    Returns:
        - 200 OK: Game played successfully, returns game details including result
        - 400 Bad Request: Invalid user choice or other validation error
    """
    data = request.data.copy()
    data['user'] = request.user.id
    
    serializer = GameSerializer(data=data)
    if serializer.is_valid():
        # Create a game instance but don't save yet
        game = serializer.save()
        
        # Generate computer's choice
        choices = [choice[0] for choice in Game.CHOICES]
        game.computer_choice = random.choice(choices)
        print(f"Computer chose: {game.computer_choice}")
        
        # Calculate result
        result = game.calculate_result()
        print(f"Game result: {result}")
        
        # Update or create game stats
        stats, created = GameStats.objects.get_or_create(user=request.user)
        stats.update_stats(result)
        print(f"Updated stats: {stats.wins} wins, {stats.losses} losses, {stats.draws} draws")
        
        # Return game data
        return Response(GameSerializer(game).data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Game Statistics API
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_game_stats(request):
    """
    Get user's game statistics.
    
    Returns:
        - 200 OK: Returns user's game statistics (total games, wins, losses, draws, win percentage)
    """
    stats, created = GameStats.objects.get_or_create(user=request.user)
    serializer = GameStatsSerializer(stats)
    return Response(serializer.data)
