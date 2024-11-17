from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.response import Response
from rest_framework import status, viewsets
from .models import CustomUser
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated
class UserViewSet(viewsets.ViewSet):
    """
    ViewSet cho người dùng với khả năng lấy danh sách, tạo, chỉnh sửa và xem thông tin cá nhân.
    """
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        """
        Lấy danh sách người dùng. Hỗ trợ lọc theo group_id.
        """
        group_id = request.query_params.get('group_id')
        users = CustomUser.objects.all()

        if group_id:
            users = users.filter(groups__id=group_id)

        serializer = UserSerializer(users, many=True)
        return Response({"data": serializer.data}, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        """
        Tạo người dùng mới.
        """
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        """
        Cập nhật thông tin người dùng (partial).
        """
        try:
            user = CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request, *args, **kwargs):
        """
        Trả về thông tin của người dùng hiện tại.
        """
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
