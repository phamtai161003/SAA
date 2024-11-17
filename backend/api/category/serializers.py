from rest_framework import serializers
from .models import Category, Task, Command

class CommandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Command
        fields = ['id', 'cmd', 'expect', 'operator', 'parser', 'task_id']

class TaskSerializer(serializers.ModelSerializer):
    commands = CommandSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = ['id', 'name', 'combine', 'scored', 'remediation', 'note', 'commands']
        read_only_fields = ['category_id']

class RecursiveField(serializers.Serializer):
    def to_representation(self, instance):
        serializer = self.parent.parent.__class__(instance, context=self.context)
        return serializer.data

class CategorySerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)
    children = RecursiveField(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'cmd', 'expect_output', 'parent', 'tasks', 'children']
        read_only_fields = ['category_id']