import os
import json
from django.utils.text import slugify


def generate_category_file(category):
    """Tạo file JSON với thông tin phân cấp Category, Task và Command."""
    if category.parent is None:  # Chỉ thực hiện với category gốc
        filename = f"{slugify(category.name)}.json"
        filepath = os.path.join(
            r'C:\Users\phamd\OneDrive\Đồ án SAA\SAA\agent\command',
            filename
        )
        data = _generate_category_hierarchy(category)
        with open(filepath, 'w', encoding='utf-8') as file:
            json.dump(data, file, indent=4, ensure_ascii=False)
        print(f"JSON file created: {filepath}")


def _generate_category_hierarchy(category):
    """Tạo cấu trúc phân cấp của Category, Task và Command."""
    # Dữ liệu cơ bản cho Category
    category_data = {
        "category": category.name,
        "slug": category.slug,
        "command": category.cmd or "No command",
        "expected_output": category.expect_output or "No expected output",
        "tasks": [],
        "children": []  # Danh sách Category con
    }

    # Lặp qua các Task của Category và thêm vào danh sách
    for task in category.tasks.all():
        task_data = {
            "task": task.name,
            "slug": task.slug,
            "combine": task.combine,
            "scored": task.scored,
            "remediation": task.remediation or "No remediation",
            "note": task.note or "No note",
            "commands": []
        }

        # Lặp qua các Command trong Task
        for command in task.commands.all():
            task_data["commands"].append({
                "command": command.cmd,
                "expected_output": command.expect or "No expected output",
                "operator": command.operator or "No operator",
                "parser": command.parser or "No parser"
            })

        # Thêm Task vào danh sách của Category
        category_data["tasks"].append(task_data)

    # Đệ quy xử lý các Category con
    for child_category in category.children.all():
        category_data["children"].append(_generate_category_hierarchy(child_category))

    return category_data


def delete_category_file(category):
    """
    Xóa file JSON của một category nếu tồn tại.
    """
    if category.parent is None:  # Chỉ xóa file của category cha
        filename = f"{slugify(category.name)}.json"
        filepath = os.path.join(
            r'C:\Users\phamd\OneDrive\Đồ án SAA\SAA\agent\command',
            filename
        )
        if os.path.exists(filepath):
            os.remove(filepath)
            print(f"Deleted file: {filepath}")
        else:
            print(f"File does not exist: {filepath}")
