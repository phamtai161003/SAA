import hashlib
import os
from django.http import FileResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

# Đường dẫn đến các file agent cho từng hệ điều hành
AGENT_FILES = {
    "linux": r"C:\Users\phamd\OneDrive\Đồ án SAA\SAA\agent\linux\linux.py",  
    "windows": r"C:\Users\phamd\OneDrive\Đồ án SAA\SAA\agent\windows\windows.py"
}

def calculate_sha256(file_path):
    """Tính toán SHA-256 cho file được chỉ định."""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

@api_view(['GET'])
def get_agent_sha(request):
    os_type = request.GET.get('os')
    if os_type not in AGENT_FILES:
        return Response({"error": "Unsupported OS type"}, status=status.HTTP_400_BAD_REQUEST)

    file_path = AGENT_FILES[os_type]
    try:
        sha256_checksum = calculate_sha256(file_path)
        return Response({"os": os_type, "sha256": sha256_checksum}, status=status.HTTP_200_OK)
    except FileNotFoundError:
        return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def download_agent(request):
    os_type = request.GET.get('os')
    if os_type not in AGENT_FILES:
        return Response({"error": "Unsupported OS type"}, status=status.HTTP_400_BAD_REQUEST)

    file_path = AGENT_FILES[os_type]

    # Kiểm tra xem file có tồn tại không
    if not os.path.exists(file_path):
        return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)

    # Trả về file để tải xuống
    response = FileResponse(open(file_path, 'rb'))
    response['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
    return response

@api_view(['POST'])
def upload_agent(request):
    if 'file' not in request.FILES:
        return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

    os_type = request.data.get('os')
    if os_type not in AGENT_FILES:
        return Response({"error": "Unsupported OS type"}, status=status.HTTP_400_BAD_REQUEST)

    file = request.FILES['file']
    file_path = AGENT_FILES[os_type]

    # Lưu file agent mới
    with open(file_path, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)

    return Response({"message": "File uploaded successfully"}, status=status.HTTP_201_CREATED)
