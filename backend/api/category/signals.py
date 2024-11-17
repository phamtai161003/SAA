import os
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Category, Task, Command

# Đường dẫn lưu file
CATEGORY_FILES_DIR = r"C:\Users\phamd\OneDrive\Đồ án SAA\SAA\agent\command"

# Tạo thư mục nếu chưa tồn tại
if not os.path.exists(CATEGORY_FILES_DIR):
    os.makedirs(CATEGORY_FILES_DIR)

def write_category_to_file(category, file, indent=0):
    indent_str = "  " * indent
    file.write(f"{indent_str}Category ID: {category.id}\n")
    file.write(f"{indent_str}Name: {category.name}\n")
    file.write(f"{indent_str}Slug: {category.slug}\n")
    file.write(f"{indent_str}Cmd: {category.cmd}\n")
    file.write(f"{indent_str}Expected Output: {category.expect_output}\n")

    # Ghi danh sách các task và command trong category
    file.write(f"{indent_str}Tasks:\n")
    for task in category.tasks.all():
        file.write(f"{indent_str}  Task ID: {task.id}\n")
        file.write(f"{indent_str}  Name: {task.name}\n")
        file.write(f"{indent_str}  Combine: {task.combine}\n")
        file.write(f"{indent_str}  Scored: {task.scored}\n")
        file.write(f"{indent_str}  Remediation: {task.remediation}\n")
        file.write(f"{indent_str}  Note: {task.note}\n")

        # Ghi danh sách command của từng task
        file.write(f"{indent_str}  Commands:\n")
        for command in task.commands.all():
            file.write(f"{indent_str}    Command ID: {command.id}\n")
            file.write(f"{indent_str}    Cmd: {command.cmd}\n")
            file.write(f"{indent_str}    Expect: {command.expect}\n")
            file.write(f"{indent_str}    Operator: {command.operator}\n")

    # Ghi các subcategory con theo đệ quy
    file.write(f"{indent_str}Subcategories:\n")
    for subcategory in category.children.all():  # Đảm bảo 'children' là related_name cho các category con
        write_category_to_file(subcategory, file, indent + 1)

def update_category_file(category):
    file_path = os.path.join(CATEGORY_FILES_DIR, f"{category.name}.txt")
    with open(file_path, "w") as file:
        write_category_to_file(category, file)

@receiver(post_save, sender=Category)
def create_or_update_category_file(sender, instance, **kwargs):
    # Gọi hàm update_category_file để ghi file khi category được tạo hoặc cập nhật
    update_category_file(instance)

@receiver(post_save, sender=Task)
def update_task_in_category_file(sender, instance, **kwargs):
    # Cập nhật file của category chứa task này
    update_category_file(instance.category)

@receiver(post_save, sender=Command)
def update_command_in_category_file(sender, instance, **kwargs):
    # Cập nhật file của category chứa command này
    update_category_file(instance.task.category)

@receiver(post_delete, sender=Category)
def delete_category_file(sender, instance, **kwargs):
    file_path = os.path.join(CATEGORY_FILES_DIR, f"{instance.name}.txt")
    if os.path.exists(file_path):
        os.remove(file_path)

@receiver(post_delete, sender=Task)
def delete_task_in_category_file(sender, instance, **kwargs):
    update_category_file(instance.category)

@receiver(post_delete, sender=Command)
def delete_command_in_category_file(sender, instance, **kwargs):
    update_category_file(instance.task.category)
