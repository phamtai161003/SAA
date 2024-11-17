from django.db import models
from django.conf import settings

class Project(models.Model):
    name = models.CharField(max_length=255)
    status = models.BooleanField(default=True)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='projects', null=True)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
