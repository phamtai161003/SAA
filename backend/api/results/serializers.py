from rest_framework import serializers
from .models import Result
from api.project.serializers import ProjectSerializer

class ResultSerializer(serializers.ModelSerializer):
    project = ProjectSerializer()
    creator = serializers.StringRelatedField()

    class Meta:
        model = Result
        fields = [
            'id', 'name', 'created', 'modified', 'ip', 'os', 'result',
            'pass_num', 'total_num', 'is_hidden', 'project', 'creator'
        ]
