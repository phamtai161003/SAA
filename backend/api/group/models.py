from django.db import models

class Group(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)  # Nếu bạn muốn thêm mô tả cho mỗi nhóm

    def __str__(self):
        return self.name
