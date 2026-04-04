from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('me/', views.get_user, name='get_user'),
    path('token/refresh/', views.token_refresh, name='token_refresh'),
]
