from django.urls import path
from .views import TelegramAuthView, UserProfileView

urlpatterns = [
    path('telegram/', TelegramAuthView.as_view(), name='telegram-auth'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
] 