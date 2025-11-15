from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import serializers
from django.db import transaction

class SignUpSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)

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
