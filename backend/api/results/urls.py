from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResultUploadView, ResultDownloadView, ResultDeleteView, ResultEditView

router = DefaultRouter()
router.register(r'results', ResultViewSet, basename='result')

urlpatterns = [
    path('', include(router.urls)),
    path('results/upload/', ResultUploadView.as_view(), name='result-upload'),
    path('results/download/', ResultDownloadView.as_view(), name='result-download'),
    path('results/delete/', ResultDeleteView.as_view(), name='result-delete'),
    path('results/edit/<int:id>/', ResultEditView.as_view(), name='result-edit'),  # API edit
]
