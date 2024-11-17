from rest_framework import serializers
from .models import ProductivityChart

class ProductivityChartSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductivityChart
        fields = ['month', 'no_project', 'no_result']
