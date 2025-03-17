from django.db import models
from django.contrib.auth.models import User

class Game(models.Model):
    CHOICES = (
        ('rock', 'Rock'),
        ('paper', 'Paper'),
        ('scissors', 'Scissors'),
    )
    
    STATUSES = (
        ('active', 'Active'),
        ('completed', 'Completed'),
    )
    
    RESULTS = (
        ('win', 'Win'),
        ('lose', 'Lose'),
        ('draw', 'Draw'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='games')
    user_choice = models.CharField(max_length=10, choices=CHOICES)
    computer_choice = models.CharField(max_length=10, choices=CHOICES)
    result = models.CharField(max_length=10, choices=RESULTS, null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUSES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def calculate_result(self):
        if self.user_choice == self.computer_choice:
            self.result = 'draw'
        elif (
            (self.user_choice == 'rock' and self.computer_choice == 'scissors') or
            (self.user_choice == 'paper' and self.computer_choice == 'rock') or
            (self.user_choice == 'scissors' and self.computer_choice == 'paper')
        ):
            self.result = 'win'
        else:
            self.result = 'lose'
        
        self.status = 'completed'
        self.save()
        
        return self.result
    
    def __str__(self):
        return f"Game {self.id}: {self.user.username} - {self.result or 'pending'}"


class GameStats(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='game_stats')
    total_games = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    draws = models.IntegerField(default=0)
    
    def update_stats(self, result):
        self.total_games += 1
        
        if result == 'win':
            self.wins += 1
        elif result == 'lose':
            self.losses += 1
        elif result == 'draw':
            self.draws += 1
            
        self.save()
    
    def __str__(self):
        return f"Stats for {self.user.username}"
