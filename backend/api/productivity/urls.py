from rest_framework.routers import DefaultRouter
from .views import ProductivityViewSet

router = DefaultRouter()
router.register(r'productivity', ProductivityViewSet)

urlpatterns = router.urls
