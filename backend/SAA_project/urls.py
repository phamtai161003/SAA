from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.project.views import ProjectViewSet
from api.category.views import CategoryViewSet, TaskViewSet, CommandViewSet
from api.productchart.views import ProductivityChartViewSet
from api.productivity.views import ProductivityViewSet
from api.results.views import ResultViewSet, ResultUploadView, ResultDownloadView
from api.user.views import UserViewSet
from api.group.views import GroupViewSet
from api.dataset.views import DatasetDownloadView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Router cho các viewset chính
router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'groups', GroupViewSet, basename='group')
router.register(r'productivity', ProductivityViewSet, basename='productivity')
router.register(r'results', ResultViewSet, basename='result')
router.register(r'users', UserViewSet, basename='user')
router.register(r'productcharts', ProductivityChartViewSet, basename='productchart')

urlpatterns = [
    # Admin interface
    path('admin/', admin.site.urls),
    path('api/agent/', include('api.agent.urls')),

    # API endpoints
    path('api/', include(router.urls)),

    # Category-related endpoints
    path('api/categories/<int:category_id>/tasks/', TaskViewSet.as_view({
        'get': 'list',
        'post': 'create',
    }), name='task-list-create'),
    path('api/categories/<int:category_id>/tasks/<int:pk>/', TaskViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy',
    }), name='task-detail'),

    # Command-related endpoints
    path('api/tasks/<int:task_id>/commands/', CommandViewSet.as_view({
        'get': 'list',
        'post': 'create',
    }), name='command-list-create'),
    path('api/commands/<int:pk>/', CommandViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy',
    }), name='command-detail'),

    # Result-related endpoints
    path('results/upload/', ResultUploadView.as_view(http_method_names=['post']), name='result-upload'),
    path('results/download/', ResultDownloadView.as_view(http_method_names=['get']), name='result-download'),  # Download endpoint
    path('results/<int:pk>/edit/', ResultViewSet.as_view({'patch': 'partial_update'}), name='result-edit'),  # Edit endpoint
    path('results/<int:pk>/delete/', ResultViewSet.as_view({'delete': 'destroy'}), name='result-delete'),  # Delete endpoint

    # Authentication endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Dataset download endpoint
    path('dataset/download/', DatasetDownloadView.as_view(), name='dataset-download'),
]
