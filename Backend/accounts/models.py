from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    first_name = models.CharField(max_length=20)
    last_name = models.CharField(max_length=40)
    studentNo = models.CharField(max_length=9, blank=True, null=True)
    phoneNo = models.CharField(max_length=11, blank=True)
    
    def __str__(self):
        return self.usernam