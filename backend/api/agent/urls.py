# backend/api/agent/urls.py
from django.urls import path
from .views import get_agent_sha, upload_agent, download_agent

urlpatterns = [
    path('sha/', get_agent_sha, name='get_agent_sha'),  # Đảm bảo endpoint này có
    path('upload/', upload_agent, name='upload_agent'),
    path('download/', download_agent, name='download_agent'),  # Endpoint tải xuống
]
