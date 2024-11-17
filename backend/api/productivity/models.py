from django.db import models
from django.contrib.auth import get_user_model
from api.project.models import Project

User = get_user_model()

class Productivity(models.Model):
    name = models.CharField(max_length=255)
    is_hidden = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='productivities')
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_productivities')

    def __str__(self):
        return self.name
    