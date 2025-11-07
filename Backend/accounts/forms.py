from django import forms
from django.core.exceptions import ValidationError
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True)
    first_name = forms.CharField(required=True, max_length=20)
    last_name = forms.CharField(required=True, max_length=40)
    studentNo = forms.CharField(required=True, max_length=9, blank=True, null=True)
    phoneNo = forms.CharField(required=False, max_length=11, blank=True)
    
    class Meta:
        model = CustomUser
        fields = ("username", "email", "first_name", "last_name", "studentNo", "phoneNo", "password1", "password2")
    
    def clean_email(self):
        email = self.cleaned_data.get('email')
        if not email:
            raise ValidationError("Email is required!")
        
        queryset = CustomUser.objects.filter(email__iexact=email)
        if self.instance.pk:
            queryset = queryset.exclude(pk=self.instance.pk)
            
        if queryset.exists():
            raise ValidationError("This email has been used!")
        
        return email
    
    def clean_studentNo(self):
        studentNo = self.cleaned_data.get('studentNo')
        if not studentNo:
            raise ValidationError("Student ID is required!")
        
        queryset = CustomUser.objects.filter(studentNo__iexact=studentNo)
        if self.instance.pk:
            queryset = queryset.exclude(pk=self.instance.pk)
            
        if queryset.exists():
            raise ValidationError("This Student ID has been used!")

        return studentNo