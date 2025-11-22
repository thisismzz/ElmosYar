from django.db import models
from django.contrib.auth.models import User


class UserMajor(models.Model):
    name = models.CharField(max_length=50, blank=False, null=False)
    abbr = models.CharField(max_length=10, blank=False, null=False)


class UserInfo(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='info')
    first_name = models.CharField(max_length=50, blank=True, null=False)
    last_name = models.CharField(max_length=50, blank=True, null=False)
    studentId = models.CharField(max_length=9, blank=True, null=False)
    phoneNo = models.CharField(max_length=11, blank=True, null=False)
    bio = models.TextField(blank=True, null=False)
    major = models.ForeignKey(UserMajor, on_delete=models.SET_NULL, blank=True, null=True)
    # avatar = models.ImageField()
    
    def __str__(self):
        return self.user.username
    


