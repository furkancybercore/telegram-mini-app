from django.contrib import admin
from .models import Game, GameStats

@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'user_choice', 'computer_choice', 'result', 'status', 'created_at')
    list_filter = ('status', 'result', 'created_at')
    search_fields = ('user__username',)

@admin.register(GameStats)
class GameStatsAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_games', 'wins', 'losses', 'draws')
    search_fields = ('user__username',)
