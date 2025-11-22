from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from rest_framework import serializers
from django.db import transaction

class SignUpSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True, allow_blank=False)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
    
    
    def validate_email(self, value):
        if not value.endswith('@iust.ac.com'):
            raise serializers.ValidationError('wrong email format!')
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('email has already been used!')
        return value
    

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True, allow_blank=False)
    password = serializers.CharField(required=True, allow_blank=False)
    rememberMe = serializers.BooleanField(default=False)