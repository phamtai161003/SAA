from django.http import JsonResponse, FileResponse, HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from cryptography.fernet import Fernet, InvalidToken
import json
import os
import base64
from pathlib import Path
from .models import Result, Project
from .utils import generate_report_from_json, evaluate_command_output
from rest_framework import viewsets
from .models import Result
from .serializers import ResultSerializer
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

class ResultViewSet(viewsets.ModelViewSet):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer


class ResultUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user

        # Lấy thông tin Project từ request
        project_id = request.data.get("project")
        if not project_id:
            return JsonResponse({"error": "Project ID is required"}, status=400)

        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return JsonResponse({"error": "Project does not exist"}, status=404)

        # Lấy crypto_key của người dùng
        crypto_key = user.crypto_key
        if not crypto_key:
            return JsonResponse({"error": "User does not have a crypto key"}, status=400)

        # Xử lý file upload
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return JsonResponse({"error": "No file uploaded"}, status=400)

        try:
            # Giải mã file
            fernet_key = Fernet(base64.urlsafe_b64encode(crypto_key.ljust(32)[:32].encode()))
            encrypted_data = uploaded_file.read()
            decrypted_data = fernet_key.decrypt(encrypted_data).decode("utf-8")
            json_data = json.loads(decrypted_data)

            # Lấy tên file từ IP (giả định tên file mã hóa là dạng IP.encrypted)
            ip_address = os.path.splitext(uploaded_file.name)[0]

            # Đường dẫn lưu báo cáo
            report_dir = Path(r"C:\Users\phamd\OneDrive\Đồ án SAA\SAA\agent\report")
            report_dir.mkdir(parents=True, exist_ok=True)
            report_path = report_dir / f"{ip_address}.docx"

            # Tính toán pass/fail với operator
            pass_num, total_num = 0, 0
            for task in json_data.get("tasks", []):
                for command in task.get("commands", []):
                    total_num += 1
                    result = evaluate_command_output(
                        command.get("output", ""),
                        command.get("expected_output", ""),
                        command.get("operator", ""),
                    )
                    if result:
                        pass_num += 1
                    command["result"] = "PASS" if result else "FAIL"  # Ghi kết quả pass/fail vào JSON

            # Tạo báo cáo Word
            generate_report_from_json(json_data, str(report_path))

            # Lưu thông tin vào Result
            Result.objects.create(
                name=ip_address,  # Sử dụng ip_address làm name
                creator=user,
                ip=ip_address,
                os="Windows",
                result=(pass_num == total_num),
                pass_num=pass_num,
                total_num=total_num,
                project=project,
            )

            return JsonResponse({"message": "Upload successful", "report_path": str(report_path)}, status=201)

        except InvalidToken:
            return JsonResponse({"error": "Invalid crypto key or corrupted file"}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format in decrypted file"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


from django.http import JsonResponse, FileResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from pathlib import Path
from .models import Result

class ResultDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        result_id = request.GET.get('id')
        file_type = request.GET.get('type', 'docx')  # Mặc định là docx
        only_score = request.GET.get('only_score', 'false').lower() == 'true'

        # Kiểm tra nếu không có ID
        if not result_id:
            return JsonResponse({"error": "Result ID is required"}, status=400)

        try:
            # Lấy result từ DB
            result = Result.objects.get(id=result_id)

            # Đường dẫn file
            file_name = f"{result.ip}.{file_type}"
            report_dir = Path(r"C:\Users\phamd\OneDrive\Đồ án SAA\SAA\agent\report")  # Thay đường dẫn thực tế
            file_path = report_dir / file_name

            # Kiểm tra file có tồn tại không
            if not file_path.exists():
                return JsonResponse({
                    "error": f"File '{file_name}' not found in directory '{report_dir}'"
                }, status=404)

            # Mở file và giữ file mở trong suốt quá trình phản hồi
            file = open(file_path, 'rb')
            response = FileResponse(file, as_attachment=True)

            # Đặt tên file chính xác từ IP của result
            response['Content-Disposition'] = f'attachment; filename="{file_name}"'
            return response

        except Result.DoesNotExist:
            return JsonResponse({"error": "Result not found"}, status=404)
        except FileNotFoundError:
            return JsonResponse({"error": "File not found on the server"}, status=404)
        except Exception as e:
            # Logging lỗi để debug trong production
            return JsonResponse({"error": f"An unexpected error occurred: {str(e)}"}, status=500)

class ResultDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        report_path = request.data.get("path")
        if not report_path or not os.path.exists(report_path):
            return JsonResponse({"error": "File not found"}, status=404)

        try:
            os.remove(report_path)
            return JsonResponse({"message": "File deleted successfully"}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
class ResultEditView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        result_id = kwargs.get("id")
        try:
            result = Result.objects.get(id=result_id)
        except Result.DoesNotExist:
            return JsonResponse({"error": "Result not found"}, status=404)

        # Lấy dữ liệu từ request để cập nhật
        name = request.data.get("name")
        project_id = request.data.get("project")
        if name:
            result.name = name
        if project_id:
            try:
                project = Project.objects.get(id=project_id)
                result.project = project
            except Project.DoesNotExist:
                return JsonResponse({"error": "Project not found"}, status=404)

        # Lưu lại kết quả
        result.save()
        return JsonResponse({"message": "Result updated successfully"}, status=200)
