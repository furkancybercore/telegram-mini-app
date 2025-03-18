from django.urls import path
from . import views

urlpatterns = [
    path('play/', views.play_game, name='play-game'),
    path('history/', views.get_game_history, name='game-history'),
    path('stats/', views.get_game_stats, name='game-stats'),
] 