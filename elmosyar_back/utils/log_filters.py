import logging
from django.utils import timezone

class AddContextFilter(logging.Filter):
    """فیلتر برای افزودن زمینه به تمام لاگ‌ها"""
    
    def filter(self, record):
        # افزودن timestamp
        record.timestamp = timezone.now().isoformat()
        
        # تنظیم مقادیر پیش‌فرض
        if not hasattr(record, 'ip'):
            record.ip = 'N/A'
        if not hasattr(record, 'user'):
            record.user = 'anonymous'
        if not hasattr(record, 'extra_data'):
            record.extra_data = '{}'
        
        return True