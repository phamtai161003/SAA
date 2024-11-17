from django.db import models
from django.contrib.auth import get_user_model
from api.project.models import Project

User = get_user_model()

class Result(models.Model):
    name = models.CharField(max_length=255)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    ip = models.CharField(max_length=100, blank=True, null=True)
    os = models.CharField(max_length=100, blank=True, null=True)
    result = models.BooleanField(default=False)
    pass_num = models.IntegerField(default=0)
    total_num = models.IntegerField(default=0)
    is_hidden = models.BooleanField(default=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='results')
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_results')

    def __str__(self):
        return self.name
