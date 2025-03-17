from rest_framework import serializers
from .models import Game, GameStats

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'user', 'user_choice', 'computer_choice', 
                  'result', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'computer_choice', 'result', 
                           'status', 'created_at', 'updated_at']

    def validate_user_choice(self, value):
        valid_choices = [choice[0] for choice in Game.CHOICES]
        if value not in valid_choices:
            raise serializers.ValidationError(
                f"Invalid choice. Must be one of: {', '.join(valid_choices)}"
            )
        return value


class GameStatsSerializer(serializers.ModelSerializer):
    win_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = GameStats
        fields = ['id', 'user', 'total_games', 'wins', 
                  'losses', 'draws', 'win_percentage']
        read_only_fields = ['id', 'user', 'total_games', 'wins', 
                           'losses', 'draws', 'win_percentage']
    
    def get_win_percentage(self, obj):
        if obj.total_games > 0:
            return round((obj.wins / obj.total_games) * 100, 2)
        return 0.0 