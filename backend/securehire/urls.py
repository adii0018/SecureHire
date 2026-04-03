from django.urls import path, include

urlpatterns = [
    path('api/auth/', include('apps.auth_app.urls')),
    path('api/sessions/', include('apps.sessions.urls')),
    path('api/alerts/', include('apps.alerts.urls')),
]
