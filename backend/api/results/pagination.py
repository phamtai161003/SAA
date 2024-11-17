from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class CustomPagination(PageNumberPagination):
    page_size = 2000
    page_size_query_param = 'page_size'
    max_page_size = 10000

    def get_paginated_response(self, data):
        return Response({
            'pagination': {
                'count': self.page.paginator.count,
                'totalPages': self.page.paginator.num_pages,
                'page': self.page.number,
                'pageSize': self.page.paginator.per_page
            },
            'results': data
        })
