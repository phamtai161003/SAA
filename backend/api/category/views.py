from django.utils.text import slugify
from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
from .models import Category, Task, Command
from .serializers import CategorySerializer, TaskSerializer, CommandSerializer
from .file_utils import generate_category_file, delete_category_file


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()  # Bao gồm cả category cha và con
    serializer_class = CategorySerializer

    def perform_create(self, serializer):
        category = serializer.save()
        root_category = category.get_root()
        generate_category_file(root_category)

    def perform_update(self, serializer):
        category = serializer.save()
        root_category = category.get_root()
        generate_category_file(root_category)

    def perform_destroy(self, instance):
        """
        Xóa category và cập nhật file TXT tương ứng.
        """
        if not instance.pk:
            raise ValidationError("Category does not exist.")

        # Nếu là category cha, xóa file TXT
        if instance.parent is None:
            delete_category_file(instance)

        # Lấy tất cả các descendants (bao gồm chính instance)
        children = instance.get_descendants(include_self=True)
        for child in children:
            child.delete()

        # Cập nhật file TXT cho category cha (nếu tồn tại)
        root_category = instance.parent if instance.parent else None
        if root_category:
            generate_category_file(root_category)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Category.DoesNotExist:
            return Response({"detail": "Category not found."}, status=status.HTTP_404_NOT_FOUND)

        parent_id = instance.parent.id if instance.parent else None  # Lấy ID của danh mục cha
        instance_id = instance.id  # Lưu ID của danh mục cần xóa trước khi xóa

        # Xóa danh mục
        self.perform_destroy(instance)

        return Response({
            "detail": "Category deleted successfully.",
            "deleted_id": instance_id,
            "parent_id": parent_id,
        }, status=status.HTTP_200_OK)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer

    def get_queryset(self):
        category_id = self.kwargs.get('category_id')
        if not category_id:
            raise ValidationError("Category ID is required.")
        return Task.objects.filter(category_id=category_id)

    def perform_create(self, serializer):
        category_id = self.kwargs.get('category_id')
        try:
            category = Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            raise ValidationError("Category does not exist")

        base_slug = slugify(serializer.validated_data['name'])
        slug = base_slug
        counter = 1

        while Task.objects.filter(slug=slug, category=category).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        task = serializer.save(category=category, slug=slug)
        generate_category_file(category.get_root())

    def perform_update(self, serializer):
        task = serializer.save()
        generate_category_file(task.category.get_root())

    def perform_destroy(self, instance):
        category = instance.category
        root_category = category.get_root()
        instance.delete()
        generate_category_file(root_category)


class CommandViewSet(viewsets.ModelViewSet):
    serializer_class = CommandSerializer

    def get_queryset(self):
        task_id = self.kwargs.get('task_id')
        if task_id:
            queryset = Command.objects.filter(task_id=task_id)
        else:
            queryset = Command.objects.all()

        # Debug queryset
        print("Queryset for Commands:", queryset)
        return queryset

    def perform_create(self, serializer):
        # Lấy task_id từ kwargs và đảm bảo task tồn tại
        task_id = self.kwargs.get('task_id')
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            raise ValidationError(f"Task with ID {task_id} does not exist.")

        # Lưu command mới và cập nhật file của root_category
        command = serializer.save(task=task)
        generate_category_file(task.category.get_root())

    def perform_update(self, serializer):
        # Cập nhật command và đồng bộ file của root_category
        command = serializer.save()
        root_category = command.task.category.get_root()
        generate_category_file(root_category)

    def perform_destroy(self, instance):
        # Trước khi xóa, lấy root_category để đồng bộ sau
        task = instance.task
        root_category = task.category.get_root()
        instance.delete()
        generate_category_file(root_category)
