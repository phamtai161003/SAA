from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from .models import Project
from .serializers import ProjectSerializer

class ProjectViewSet(ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    

def perform_create(self, serializer):
        serializer.save(creator=self.request.user)
def update(self, request, *args, **kwargs):
        project = self.get_object()
        if project.creator != request.user:
            return Response({"detail": "Bạn không có quyền chỉnh sửa dự án này."}, status=403)
        return super().update(request, *args, **kwargs)
def destroy(self, request, *args, **kwargs):
        project = self.get_object()
        if project.creator != request.user:
            return Response({"detail": "Bạn không có quyền xóa dự án này."}, status=403)
        return super().destroy(request, *args, **kwargs)
