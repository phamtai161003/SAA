from django.contrib import admin
from .models import Result

class ResultAdmin(admin.ModelAdmin):
    list_display = ('name', 'created', 'total_criteria', 'pass_count', 'fail_count', 'report_file')

    def total_criteria(self, obj):
        return obj.total_num  # Sử dụng `total_num` từ model `Result`
    total_criteria.short_description = "Total Criteria"

    def pass_count(self, obj):
        return obj.pass_num  # Sử dụng `pass_num` từ model `Result`
    pass_count.short_description = "Pass Count"

    def fail_count(self, obj):
        return obj.total_num - obj.pass_num  # Tính số lượng fail
    fail_count.short_description = "Fail Count"

    def report_file(self, obj):
        # Liên kết file báo cáo nếu có
        report_url = f"/path/to/reports/{obj.name}.docx"  # Đường dẫn tới file báo cáo
        return f'<a href="{report_url}" target="_blank">Download Report</a>'
    report_file.allow_tags = True
    report_file.short_description = "Report File"

admin.site.register(Result, ResultAdmin)
