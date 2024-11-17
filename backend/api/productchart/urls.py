from django.urls import path
from .views import ProductivityChartAPIView

urlpatterns = [
    path('api/productchart/<str:month>/', ProductivityChartAPIView.as_view(), name='productchart')
]
