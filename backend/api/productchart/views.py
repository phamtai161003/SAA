from rest_framework.viewsets import ReadOnlyModelViewSet
from .models import ProductivityChart
from .serializers import ProductivityChartSerializer

class ProductivityChartViewSet(ReadOnlyModelViewSet):
    queryset = ProductivityChart.objects.all()
    serializer_class = ProductivityChartSerializer
