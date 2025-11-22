from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from rest_framework import serializers
from django.db import transaction
from .models import UserInfo, UserMajor

class SignUpSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True, allow_blank=False)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
    
    
    def validate_username(self, value):
        user = self.instance
        qs = User.objects.filter(username__iexact=value)
        if user:
            qs = qs.exclude(pk=user.pk)
        if qs.exists():
            raise serializers.ValidationError('username has already been used!')
        return value
    
    def validate_email(self, value):
        if not value.endswith('iust.ac.ir'):
            raise serializers.ValidationError('wrong email format!')
        user = self.instance
        qs = User.objects.filter(email__iexact=value)
        if user:
            qs = qs.exclude(pk=user.pk)
        if qs.exists():
            raise serializers.ValidationError('email has already been used!')
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
    user = SignUpSerializer()
    major = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = UserInfo
        fields = [
            'user', 'firstname', 'lastname', 'studentId', 'phoneNo', 'info', 'bio', 'major'
        ]

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        if user_data:
            user_serializer = self.fields['user']
            user_serializer.update(instance.user, user_data)

        major_name = validated_data.pop('major', None)
        if major_name:
            try:
                major_obj = UserMajor.objects.get(name=major_name)
            except UserMajor.DoesNotExist:
                raise serializers.ValidationError({"major": "this major does not exists"})
            instance.major = major_obj

        for attr in ['firstname', 'lastname', 'phoneNo', 'bio']:
            if attr in validated_data:
                setattr(instance, attr, validated_data[attr])

        instance.save()
        return instance
