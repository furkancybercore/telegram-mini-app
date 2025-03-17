"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['GET', 'HEAD'])
@permission_classes([AllowAny])
def health_check(request):
    """Simple health check endpoint that returns a 200 OK response."""
    return JsonResponse({"status": "ok"}, status=200)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include([
        path('health-check/', health_check, name='health-check'),
        path('auth/', include('telegram_auth.urls')),
        path('game/', include('game.urls')),
    ])),
]
