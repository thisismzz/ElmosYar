from django.db import models
from django.contrib.auth.models import User

class UserInfo(models.Model):
    MAJORS = [
        ('CS', 'Computer Science'),
        ('CE', 'Computer Engineering'),
        ('EE', 'Electrical Engineering'),
        ('ME', 'Mechanical Engineering'),
        ('CIV', 'Civil Engineering'),
    ]
    
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    studentId = models.CharField(max_length=9, blank=True, null=False)
    phoneNo = models.CharField(max_length=11, blank=True, null=False)
    bio = models.TextField(blank=True, null=False)
    major = models.CharField(max_length=50, choices=MAJORS, blank=True, null=False)

