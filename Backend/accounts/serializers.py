from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import serializers
from django.db import transaction
from .models import UserInfo

class SignUpSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True, allow_blank=False)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
    
    
    def validate_email(self, value):
        if not value.endswith('@iust.com'):
            raise serializers.ValidationError('wrong email format!')
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('email has already been used!')
        return value
    
    
    def validate_password(self, value):
        temp_user = User(username = self.initial_data.get('username'))
        try:
            validate_password(value, user=temp_user)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value
            
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError("Passwords are not match!")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True, allow_blank=False)
    password = serializers.CharField(required=True, allow_blank=False)
    rememberMe = serializers.BooleanField(default=False)
 # serializers.py

class UserProfileSerializer(serializers.ModelSerializer):
    # Include User fields that you want to expose/edit
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = UserInfo
        fields = [
            "username",
            "email",
            "studentId",
            "phoneNo",
            "bio",
            "info",
            "avatar",
        ]

    def update(self, instance, validated_data):
        # Because username/email are read-only, only update UserInfo fields
        user_info_data = validated_data

        for field, value in user_info_data.items():
            setattr(instance, field, value)

        instance.save()
        return instance
