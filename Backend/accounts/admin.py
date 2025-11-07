from django.contrib import admin
from .models import CustomUser
from .forms import CustomUserCreationForm
from django.contrib.auth.admin import UserAdmin

class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    model = CustomUser

    fieldsets = UserAdmin.fieldsets + (
        ('Extra', {'fields': ('studentNo',)})
    )


    add_fieldsets = (
        (None, {
            'classes': ('wide'),
            'fields': ("username", "email", "first_name", "last_name", "studentNo", "password1", "password2")
        })
    )

admin.site.register(CustomUser, CustomUserAdmin)