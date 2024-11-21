from django.http import FileResponse, JsonResponse
from django.views import View
from pathlib import Path
from cryptography.fernet import Fernet, InvalidToken
from datetime import datetime, timedelta
import base64
import os


class DatasetDownloadView(View):

    def get(self, request, *args, **kwargs):
        # Lấy crypto_key từ query params
        crypto_key = request.GET.get('key')
        if not crypto_key:
            return JsonResponse({"error": "Crypto key is required"}, status=400)

        # Đảm bảo crypto_key là key hợp lệ cho Fernet
        try:
            fernet_key = base64.urlsafe_b64encode(crypto_key.ljust(32)[:32].encode())
        except Exception as e:
            return JsonResponse({"error": f"Invalid crypto key: {str(e)}"}, status=400)

        # Lấy thông tin từ query params
        try:
            activation_days = int(request.GET.get('activation_days', 1))  # Mặc định là 1 ngày
        except ValueError:
            return JsonResponse({"error": "activation_days must be an integer"}, status=400)

        category_slug = request.GET.get('category')
        if not category_slug:
            return JsonResponse({"error": "Category is required"}, status=400)

        # Xác định đường dẫn file JSON
        file_path = Path(f'C:/Users/phamd/OneDrive/Đồ án SAA/SAA/agent/command/{category_slug}.json')
        if not file_path.exists():
            return JsonResponse({"error": "File not found"}, status=404)

        # Tạo ngày hết hạn
        expiration_date = (datetime.now() + timedelta(days=activation_days)).strftime('%Y-%m-%d')

        # Xử lý mã hóa file JSON và gửi về phía người dùng
        try:
            cipher_suite = Fernet(fernet_key)
            with open(file_path, 'rb') as f:
                file_data = f.read()

            # Thêm ngày hết hạn vào dữ liệu JSON
            data_to_encrypt = f"{expiration_date}\n".encode('utf-8') + file_data
            encrypted_data = cipher_suite.encrypt(data_to_encrypt)

            # Tạo file mã hóa tạm thời
            encrypted_file_path = file_path.with_suffix('.encrypted')
            with open(encrypted_file_path, 'wb') as temp_file:
                temp_file.write(encrypted_data)

            # Mở file để gửi phản hồi
            response_file = open(encrypted_file_path, 'rb')
            response = FileResponse(response_file, as_attachment=True, filename=f"{category_slug}.encrypted")

            # Gắn callback xóa file sau khi hoàn tất phản hồi
            response.file_to_cleanup = encrypted_file_path
            response.cleanup_callback = self.cleanup_temp_file
            return response

        except InvalidToken:
            return JsonResponse({"error": "Encryption failed due to invalid crypto key"}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Error processing file: {str(e)}"}, status=500)

    @staticmethod
    def cleanup_temp_file(response):
        """Đóng file và xóa file tạm sau khi phản hồi hoàn tất."""
        try:
            if hasattr(response, "file_to_cleanup"):
                file_to_cleanup = response.file_to_cleanup
                if file_to_cleanup and os.path.exists(file_to_cleanup):
                    os.remove(file_to_cleanup)
        except Exception as e:
            print(f"Failed to clean up temporary file: {e}")
