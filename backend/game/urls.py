from django.urls import path
from .views import GameView, GameStatsView

urlpatterns = [
    path('play/', GameView.as_view(), name='play-game'),
    path('history/', GameView.as_view(), name='game-history'),
    path('stats/', GameStatsView.as_view(), name='game-stats'),
] 