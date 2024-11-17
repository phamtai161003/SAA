from django.contrib import admin
from .models import Project

# Đăng ký mô hình Category trong trang Admin
admin.site.register(Project)
