import subprocess

def execute_command(command):
    """Thực thi một câu lệnh và trả về kết quả."""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        return result.stdout, result.stderr
    except Exception as e:
        return "", str(e)

def read_commands(file_path):
    """Đọc các câu lệnh từ file."""
    with open(file_path, 'r') as file:
        commands = [line.strip() for line in file if line.strip() and not line.startswith('#')]
    return commands

def write_results(results, output_file):
    """Ghi kết quả vào file log."""
    with open(output_file, 'w') as file:
        for command, output, error in results:
            file.write(f"Command: {command}\n")
            file.write(f"Output: {output}\n")
            file.write(f"Error: {error}\n")
            file.write("=" * 50 + "\n")

def main():
    commands_file = 'commands_linux.txt'  # Đường dẫn đến file commands.txt cho Linux
    log_file = 'execution_results_linux.log'  # File để ghi lại kết quả

    commands = read_commands(commands_file)
    results = []

    for command in commands:
        output, error = execute_command(command)
        results.append((command, output, error))

    write_results(results, log_file)
    print(f"Execution results saved to {log_file}")

if __name__ == "__main__":
    main()
