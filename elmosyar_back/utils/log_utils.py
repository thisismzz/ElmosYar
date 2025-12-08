import logging
import json
from functools import wraps
from django.conf import settings

# ایجاد یک لاگر اصلی
logger = logging.getLogger('django')

class ContextLogger:
    """کلاس برای لاگ‌گیری با زمینه (context)"""
    
    def __init__(self, logger_name='django'):
        self.logger = logging.getLogger(logger_name)
        
    def log(self, level, message, request=None, **extra):
        """لاگ با اطلاعات زمینه"""
        log_data = self._prepare_log_data(request, extra)
        
        if level == 'info':
            self.logger.info(message, extra=log_data)
        elif level == 'error':
            self.logger.error(message, extra=log_data)
        elif level == 'warning':
            self.logger.warning(message, extra=log_data)
        elif level == 'debug':
            self.logger.debug(message, extra=log_data)
        elif level == 'critical':
            self.logger.critical(message, extra=log_data)
    
    def _prepare_log_data(self, request, extra_data):
        """آماده‌سازی داده‌های زمینه برای لاگ"""
        log_data = {
            'ip': 'N/A',
            'user': 'anonymous',
            'extra_data': '{}'
        }
        
        if request:
            # گرفتن IP
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = request.META.get('REMOTE_ADDR')
            log_data['ip'] = ip
            
            # گرفتن کاربر
            if hasattr(request, 'user') and request.user.is_authenticated:
                log_data['user'] = str(request.user.id)
        
        # اضافه کردن داده‌های اضافی
        if extra_data:
            try:
                log_data['extra_data'] = json.dumps(extra_data, ensure_ascii=False, default=str)
            except:
                log_data['extra_data'] = str(extra_data)
        
        return log_data
    
    def log_api_request(self, view_func):
        """دکوراتور برای لاگ کردن درخواست‌های API"""
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            # لاگ قبل از اجرای view
            self.log('info', 
                    f'API Request: {request.method} {request.path}',
                    request,
                    view_name=view_func.__name__,
                    query_params=dict(request.GET))
            
            try:
                response = view_func(request, *args, **kwargs)
                
                # لاگ بعد از اجرای view
                self.log('info',
                        f'API Response: {response.status_code}',
                        request,
                        view_name=view_func.__name__,
                        status_code=response.status_code)
                
                return response
            except Exception as e:
                self.log('error',
                        f'API Exception: {str(e)}',
                        request,
                        view_name=view_func.__name__,
                        exception_type=type(e).__name__)
                raise
        
        return wrapper

# ایجاد نمونه اصلی
context_logger = ContextLogger()

# توابع سریع برای استفاده در اپلیکیشن‌ها
def log_info(message, request=None, **extra):
    """لاگ info سریع"""
    context_logger.log('info', message, request, **extra)

def log_error(message, request=None, **extra):
    """لاگ error سریع"""
    context_logger.log('error', message, request, **extra)

def log_warning(message, request=None, **extra):
    """لاگ warning سریع"""
    context_logger.log('warning', message, request, **extra)