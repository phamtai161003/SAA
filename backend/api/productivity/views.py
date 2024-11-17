from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Productivity
from .serializers import ProductivitySerializer

class ProductivityViewSet(viewsets.ModelViewSet):
    queryset = Productivity.objects.all()
    serializer_class = ProductivitySerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Tự động thêm người dùng đang đăng nhập là người tạo
        serializer.save(creator=self.request.user)
