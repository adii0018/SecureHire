from django.urls import path
from . import views

urlpatterns = [
    path('', views.create_alert, name='create_alert'),
    path('<str:session_code>/', views.get_session_alerts, name='get_session_alerts'),
]
