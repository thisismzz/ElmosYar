from django.contrib import admin
from .models import UserWallet, Transaction

@admin.register(UserWallet)
class UserWalletAdmin(admin.ModelAdmin):
    list_display = ['user', 'balance', 'created_at', 'updated_at']
    search_fields = ['user__username', 'user__email']
    list_filter = ['created_at']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'wallet', 'amount', 'type', 'status', 'from_user', 'to_user', 'registered_in']
    list_filter = ['type', 'status', 'registered_in']
    search_fields = ['wallet__user__username', 'from_user__username', 'to_user__username', 'authority']
    readonly_fields = ['registered_in']
    date_hierarchy = 'registered_in'
