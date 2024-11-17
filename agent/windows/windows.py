import argparse
import subprocess
from cryptography.fernet import Fernet, InvalidToken
import os
import base64
import json


def generate_fernet_key(crypto_key):
    """Chuyển đổi crypto_key thành một Fernet key hợp lệ."""
    try:
        padded_key = crypto_key.ljust(32)[:32]
        return base64.urlsafe_b64encode(padded_key.encode())
    except Exception as e:
        print(f"Error generating Fernet key: {str(e)}")
        return None


def decrypt_file(input_file, crypto_key, ip):
    """Giải mã file đã mã hóa và lưu kết quả vào file log theo IP."""
    output_file = f"{ip}.log"
    fernet_key = generate_fernet_key(crypto_key)
    if not fernet_key:
        print("Invalid crypto key. Exiting...")
        return None

    try:
        cipher_suite = Fernet(fernet_key)
        with open(input_file, 'rb') as file:
            encrypted_data = file.read()

        decrypted_data = cipher_suite.decrypt(encrypted_data).decode('utf-8')

        # Loại bỏ dòng ngày hết hạn trước khi ghi vào file
        lines = decrypted_data.split('\n')
        expiration_date = lines[0]  # Ngày hết hạn
        json_data = '\n'.join(lines[1:])  # Nội dung JSON

        with open(output_file, 'w', encoding='utf-8') as file:
            file.write(json_data)

        print(f"Decrypted content saved to: {output_file}")
        print(f"Expiration date: {expiration_date}")
        return output_file
    except InvalidToken:
        print("Invalid crypto key or corrupted file.")
        return None
    except UnicodeEncodeError as e:
        print(f"Encoding error: {e}")
        return None
    except Exception as e:
        print(f"Error decrypting file: {str(e)}")
        return None


def encrypt_file(file_path, crypto_key):
    """Mã hóa file đã tạo ra bằng chính crypto_key."""
    fernet_key = generate_fernet_key(crypto_key)
    if not fernet_key:
        print("Invalid crypto key. Exiting...")
        return None

    try:
        cipher_suite = Fernet(fernet_key)
        with open(file_path, 'rb') as file:
            file_data = file.read()

        encrypted_data = cipher_suite.encrypt(file_data)
        encrypted_file_path = f"{file_path}.encrypted"

        with open(encrypted_file_path, 'wb') as file:
            file.write(encrypted_data)

        print(f"Encrypted file saved to: {encrypted_file_path}")

        # Xóa file gốc ngay lập tức sau khi mã hóa
        try:
            os.remove(file_path)
            print(f"Deleted original file: {file_path}")
        except Exception as e:
            print(f"Failed to delete original file: {file_path}. Error: {e}")

        return encrypted_file_path
    except Exception as e:
        print(f"Error encrypting file: {str(e)}")
        return None


def execute_command(command):
    """Thực thi lệnh trong một phiên CMD mới."""
    try:
        process = subprocess.Popen(
            ["cmd", "/c", command],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            shell=False
        )
        stdout, stderr = process.communicate()
        return stdout.strip(), stderr.strip()
    except Exception as e:
        return "", str(e)


def process_category(category):
    """Thực thi lệnh trong các task và thêm kết quả `output` vào commands."""
    if "tasks" in category:
        for task in category["tasks"]:
            for command_entry in task.get("commands", []):
                command = command_entry.get("command", "")
                output, error = execute_command(command)
                # Lưu lại thông tin `output` hoặc `error`
                command_entry["output"] = output if not error else error

    # Xử lý các category con
    if "children" in category:
        for child in category["children"]:
            process_category(child)


def write_results_to_log(category, log_file):
    """Ghi kết quả đã xử lý vào file log theo cấu trúc JSON."""
    with open(log_file, 'w', encoding='utf-8') as file:
        json.dump(category, file, indent=4, ensure_ascii=False)


def main():
    parser = argparse.ArgumentParser(description="Process an encrypted JSON command file.")
    parser.add_argument("--input-file", required=True, help="Path to the encrypted input file")
    parser.add_argument("--crypto-key", required=True, help="Crypto key for decryption and re-encryption")
    parser.add_argument("--ip", required=True, help="IP address for logging output")
    args = parser.parse_args()

    # Giải mã file
    decrypted_file_path = decrypt_file(args.input_file, args.crypto_key, args.ip)
    if not decrypted_file_path:
        print("Decryption failed. Exiting...")
        return

    # Đọc nội dung JSON từ file giải mã
    try:
        with open(decrypted_file_path, 'r', encoding='utf-8') as file:
            category_data = json.load(file)
    except Exception as e:
        print(f"Failed to read JSON data: {str(e)}")
        return

    # Thực thi lệnh và thêm `output` vào từng `command`
    process_category(category_data)

    # Ghi kết quả vào file log
    write_results_to_log(category_data, decrypted_file_path)
    print(f"Results saved to {decrypted_file_path}")

    # Mã hóa file log sau khi ghi kết quả bằng chính `crypto_key`
    encrypted_log_path = encrypt_file(decrypted_file_path, args.crypto_key)
    if encrypted_log_path:
        print(f"Encrypted log file created at: {encrypted_log_path}")


if __name__ == "__main__":
    main()
