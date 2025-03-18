"""
Django Views for Telegram Mini App Game API.

This file contains simple view functions for game operations.

API Endpoints:
- `GET /api/game/history/` → Retrieves the user's game history.
- `POST /api/game/play/` → Plays a new game and returns the result.
- `GET /api/game/stats/` → Retrieves the user's game statistics.
"""
from django.shortcuts import render
import random
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view

from .models import Game, GameStats
from .serializers import GameSerializer, GameStatsSerializer


# Game History API
@api_view(["GET"])
def get_game_history(request):
    """Get user's game history."""
    games = Game.objects.filter(user=request.user).order_by('-created_at')
    serializer = GameSerializer(games, many=True)
    return Response(serializer.data)


# Play Game API
@api_view(["POST"])
def play_game(request):
    """Play a game of rock-paper-scissors."""
    data = request.data.copy()
    data['user'] = request.user.id
    
    serializer = GameSerializer(data=data)
    if serializer.is_valid():
        # Create a game instance
        game = serializer.save()
        
        # Generate computer's choice
        choices = [choice[0] for choice in Game.CHOICES]
        game.computer_choice = random.choice(choices)
        
        # Calculate result
        result = game.calculate_result()
        
        # Update or create game stats
        stats, created = GameStats.objects.get_or_create(user=request.user)
        stats.update_stats(result)
        
        # Return game data
        return Response(GameSerializer(game).data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Game Statistics API
@api_view(["GET"])
def get_game_stats(request):
    """Get user's game statistics."""
    stats, created = GameStats.objects.get_or_create(user=request.user)
    serializer = GameStatsSerializer(stats)
    return Response(serializer.data)
