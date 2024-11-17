from rest_framework import serializers
from .models import Project

class ProjectSerializer(serializers.ModelSerializer):
    creator = serializers.StringRelatedField()  # Hiển thị username của creator thay vì id

    class Meta:
        model = Project
        fields = ['id', 'name', 'status', 'creator', 'created', 'modified']
        read_only_fields = ['id', 'created', 'modified']
