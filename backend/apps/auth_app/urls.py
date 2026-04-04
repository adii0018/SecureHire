from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('google/', views.google_auth, name='google_auth'),
    path('me/', views.get_user, name='get_user'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
