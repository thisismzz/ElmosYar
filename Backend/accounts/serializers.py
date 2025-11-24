from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from rest_framework import serializers
from django.db import transaction
from .models import UserInfo, UserMajor
from rest_framework.validators import UniqueValidator

class SignUpSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True, allow_blank=False)
    username = serializers.CharField(
        validators=[UniqueValidator(queryset=User.objects.all(),message="این نام کاربری قبلا استفاده شده است")]
    )
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
    
    
    def validate_email(self, value):
        if not value.endswith('iust.ac.ir'):
            raise serializers.ValidationError('فرمت ایمیل اشتباه است')
        user = self.instance
        qs = User.objects.filter(email__iexact=value)
        if user:
            qs = qs.exclude(pk=user.pk)
        if qs.exists():
            raise serializers.ValidationError('این ایمیل قبلا استفاده شده است')
        return value
    

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
    
    def update(self, instance, validated_data):
        if 'password' in validated_data:
            instance.set_password(validated_data.pop('password'))
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True, allow_blank=False)
    password = serializers.CharField(required=True, allow_blank=False)
    rememberMe = serializers.BooleanField(default=False)
    
    
class UserInfoSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False)
    email = serializers.CharField(required=False)
    major = serializers.CharField(required=False)

    class Meta:
        model = UserInfo
        fields = [
            'username', 'email', 'firstname', 'lastname', 'studentId', 'phoneNo', 'info', 'bio', 'major'
        ]
        
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['username'] = instance.user.username
        data['email'] = instance.user.email
        return data

    def update(self, instance, validated_data):
        user = instance.user
        
        new_username = validated_data.pop('username', None)
        new_email = validated_data.pop('email', None)
        if new_username:
            if User.objects.exclude(pk=user.pk).filter(username__iexact=new_username).exists():
                raise serializers.ValidationError({"username" : ["این نام کاربری قبلا استفاده شده است"]})
            user.username = new_username
        
        if new_email:
            if User.objects.exclude(pk=user.pk).filter(email__iexact=new_email).exists():
                raise serializers.ValidationError({'email' : ['این ایمیل قبلا استفاده شده است']})
            if not new_email.endswith("iust.ac.ir"):
                raise serializers.ValidationError({'email' : ['فرمت ایمیل اشتباه است']})
            user.email = new_email
        
        user.save()
        
        new_major = validated_data.pop('major', None)
        if new_major:
            try:
                new_major_obj = UserMajor.objects.get(name=new_major)
            except UserMajor.DoesNotExist:
                raise serializers.ValidationError({'major' : ["رشته تحصیلی وارد شده معتبر نیست"]})
            instance.major = new_major_obj

        for attr in ['firstname', 'lastname', 'studentId', 'phoneNo', 'info', 'bio']:
            if attr in validated_data:
                setattr(instance, attr, validated_data[attr])

        instance.save()
        return instance
