from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    date_joined = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    last_login = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", allow_null=True, read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id',         # Cần để xác định user
            'username',
            'is_staff',
            'is_active',
            'date_joined',
            'last_login',
            'crypto_key',
        ]
        
