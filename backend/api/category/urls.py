# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, TaskViewSet, CommandViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'commands', CommandViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
]
