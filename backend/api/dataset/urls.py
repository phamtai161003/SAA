from django.urls import path
from .views import DatasetDownloadView

urlpatterns = [
    # API dataset
    path('dataset/download/', DatasetDownloadView.as_view(), name='dataset-download'),
]
