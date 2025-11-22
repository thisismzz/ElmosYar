from django.db import models
from django.contrib.auth.models import User

class UserInfo(models.Model):
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    studentId = models.CharField(max_length=9, blank=True, null=False)
    phoneNo = models.CharField(max_length=11, blank=True, null=False)
    bio = models.TextField(blank=True, null=False)
    info = models.TextField(blank=True, null=False)
    avatar = models.TextField(blank=True, null=False)

