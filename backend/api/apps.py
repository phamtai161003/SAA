from django.apps import AppConfig

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend.api'  # Đường dẫn đầy đủ của ứng dụng

    def ready(self):
        import backend.api.signals  # Đảm bảo load đúng đường dẫn đến signals
