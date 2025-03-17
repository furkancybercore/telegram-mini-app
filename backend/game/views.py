from django.shortcuts import render
import random
from django.db import transaction
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import Game, GameStats
from .serializers import GameSerializer, GameStatsSerializer

# Create your views here.

class GameView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user's game history"""
        games = Game.objects.filter(user=request.user).order_by('-created_at')
        serializer = GameSerializer(games, many=True)
        return Response(serializer.data)
    
    @transaction.atomic
    def post(self, request):
        """Play a game of rock-paper-scissors"""
        data = request.data.copy()
        data['user'] = request.user.id
        
        serializer = GameSerializer(data=data)
        if serializer.is_valid():
            # Create a game instance but don't save yet
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


class GameStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user's game statistics"""
        stats, created = GameStats.objects.get_or_create(user=request.user)
        serializer = GameStatsSerializer(stats)
        return Response(serializer.data)
