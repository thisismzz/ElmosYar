import os
import glob
from datetime import datetime, timedelta
from django.conf import settings

class LogManager:
    @staticmethod
    def get_recent_logs(days=7):
        """دریافت لاگ‌های چند روز اخیر"""
        logs = []
        for i in range(days):
            date = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
            log_file = os.path.join(settings.LOG_DIR, f'django_{date}.log')
            
            if os.path.exists(log_file):
                with open(log_file, 'r', encoding='utf-8') as f:
                    logs.append(f"=== Logs for {date} ===")
                    logs.extend(f.readlines())
        
        return '\n'.join(logs)
    
    @staticmethod
    def search_logs(keyword, app_name=None, level=None):
        """جستجو در لاگ‌ها"""
        results = []
        log_files = glob.glob(os.path.join(settings.LOG_DIR, 'django_*.log'))
        
        for log_file in sorted(log_files, reverse=True):
            with open(log_file, 'r', encoding='utf-8') as f:
                for line in f:
                    if keyword.lower() in line.lower():
                        if app_name and f'[{app_name}' not in line:
                            continue
                        if level and f'[{level}]' not in line:
                            continue
                        results.append(line)
        
        return results
    
    @staticmethod
    def get_stats():
        """آمار لاگ‌ها"""
        stats = {
            'total_logs': 0,
            'by_level': {},
            'by_app': {},
            'errors_today': 0
        }
        
        today = datetime.now().strftime("%Y-%m-%d")
        today_log = os.path.join(settings.LOG_DIR, f'django_{today}.log')
        
        if os.path.exists(today_log):
            with open(today_log, 'r', encoding='utf-8') as f:
                for line in f:
                    stats['total_logs'] += 1
                    
                    # شمارش بر اساس سطح
                    for level in ['ERROR', 'WARNING', 'INFO', 'DEBUG']:
                        if f'[{level}]' in line:
                            stats['by_level'][level] = stats['by_level'].get(level, 0) + 1
                    
                    # شمارش بر اساس اپلیکیشن
                    import re
                    app_match = re.search(r'\[(\w+)\.', line)
                    if app_match:
                        app = app_match.group(1)
                        stats['by_app'][app] = stats['by_app'].get(app, 0) + 1
        
        return stats