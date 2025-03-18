from django.urls import path
from . import views

urlpatterns = [
    path('telegram/', views.telegram_auth, name='telegram-auth'),
    path('profile/', views.get_user_profile, name='user-profile-get'),
    path('profile/update/', views.update_user_profile, name='user-profile-update'),
] 