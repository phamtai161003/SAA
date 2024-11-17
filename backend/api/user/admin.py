from django.contrib import admin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'crypto_key', 'is_staff', 'is_active')
    readonly_fields = ('crypto_key',)
