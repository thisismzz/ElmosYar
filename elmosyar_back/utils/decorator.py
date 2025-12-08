from functools import wraps
from . import context_logger

def auto_log_api(view_func):
    """دکوراتور برای لاگ خودکار API"""
    return context_logger.log_api_request(view_func)