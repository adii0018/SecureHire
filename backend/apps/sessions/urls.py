from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_session, name='create_session'),
    path('', views.list_sessions, name='list_sessions'),
    path('<str:code>/', views.get_session, name='get_session'),
    path('<str:code>/update/', views.update_session, name='update_session'),
    path('<str:code>/end/', views.end_session, name='end_session'),
    path('<str:code>/delete/', views.delete_session, name='delete_session'),
]
