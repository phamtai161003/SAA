from django.contrib import admin
from .models import Category, Task, Command

# Register each model separately in the admin site
admin.site.register(Category)
admin.site.register(Task)
admin.site.register(Command)
