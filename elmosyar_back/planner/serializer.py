from rest_framework import serializers
from .models import Planner, Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['planner', 'title', 'description', 'start_date', 'end_date', 'is_done', 'created_at']

class PlannerSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)

    class Meta:
        model = Planner
        fields = ['user', 'title', 'description', 'created_at', 'tasks']
