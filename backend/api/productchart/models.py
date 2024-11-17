from django.db import models
from api.project.models import Project
from api.results.models import Result

class ProductivityChart(models.Model):
    month = models.CharField(max_length=50, unique=True)  # Tháng được lưu dưới dạng chuỗi và là duy nhất

    def __str__(self):
        return f"Chart for {self.month}"

    @property
    def no_project(self):
        # Tính số lượng dự án trong tháng
        start_date, end_date = self._get_month_date_range()
        return Project.objects.filter(created__range=[start_date, end_date]).count()

    @property
    def no_result(self):
        # Tính số lượng kết quả trong tháng
        start_date, end_date = self._get_month_date_range()
        return Result.objects.filter(created__range=[start_date, end_date]).count()

    def _get_month_date_range(self):
        """ Trả về khoảng thời gian đầu và cuối của tháng. """
        from datetime import datetime
        from dateutil.relativedelta import relativedelta

        # Chuyển đổi chuỗi tháng thành ngày bắt đầu tháng và ngày kết thúc tháng
        start_date = datetime.strptime(self.month, "%Y-%m")
        end_date = start_date + relativedelta(months=1) - relativedelta(days=1)
        return start_date, end_date
