from django.urls import path
from . import views

urlpatterns = [
    # Обычный вход для Django шаблонов
    path('', views.user_login, name='login'),
    
    # API для React (если используется)
    path('api/login/', views.api_login, name='api_login'),
    path('api/logout/', views.api_logout, name='api_logout'),
]