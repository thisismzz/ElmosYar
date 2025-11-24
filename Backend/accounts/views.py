from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status, generics
from rest_framework.views import APIView
from .serializers import SignUpSerializer, LoginSerializer, UserInfoSerializer
from .models import UserInfo
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import timedelta

class UserInfoView(generics.RetrieveUpdateAPIView):
    serializer_class = UserInfoSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.profile
    
    def put(self, request, *args, **kwargs):
        return self._update(request, partial=False)
    
    def patch(self, request, *args, **kwargs):
        return self._update(request, partial=True)
    
    def get(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except UserInfo.DoesNotExist:
            return Response({"error": True,
                             "message": "پروفایل وجود ندارد",
                             "code": "USER_PROFILE_NOT_FOUND",}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(instance)
        return Response({"error": False,
                         "message": "پروفایل با موفقیت دریافت شد",
                         "code": "USER_PROFILE_FETCHED",
                         "data": serializer.data}, status=status.HTTP_200_OK)

    def _update(self, request, partial):
        profile = self.get_object()
        serializer = self.get_serializer(profile, data=request.data, partial=partial)
        
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
        except ValidationError as exc:
            return Response({'error': True,
                             'message': 'مقادیر وارد شده نامعتبر است',
                             'code': 'USER_PROFILE_UPDATE_INVALID',
                             'details': exc.detail}, status=status.HTTP_409_CONFLICT)

        return Response({
            'error': False,
            'message': 'پروفایل با موفقیت بروزرسانی شد',
            'code': 'USER_PROFILE_UPDATED',
            'data': serializer.data}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_other_user_profile(request, username):
    try:
        user = User.objects.get(username=username)
        profile = user.profile
        
    except User.DoesNotExist:
        return Response({
            'error': True,
            'message': 'کاربر مورد نظر یافت نشد',
            'code': 'USER_NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)
        
    except UserInfo.DoesNotExist:
        return Response({
            'error': True,
            'message': 'پروفایلی برای این کاربر ساخته نشده است',
            'code': 'PROFILE_NOT_FOUND'}, status=status.HTTP_404_NOT_FOUND)

    serializer = UserInfoSerializer(profile)
    return Response({'error': False,
                     'message': 'کاربر یافت شد',
                     'code': 'USER_PROFILE_FETCHED',
                     'data': serializer.data}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    serializer = SignUpSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        
        return Response({'error' : False,
                         'message' : 'ثبت‌نام با موفقیت انجام شد',
                         'code' : 'AUTH_REGISTER_SUCCESS',
                         'data' : {"access": str(refresh.access_token),
                                   "refresh": str(refresh)}}, status=status.HTTP_201_CREATED)
    
    return Response({'error' : True,
                     'message' : "مقادیر وارد شده نامعتبر است",
                     'code' : 'AUTH_REGISTER_INVALID',
                     'details' : serializer.errors}, status=status.HTTP_409_CONFLICT)


class Logout(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({'error' : True,
                             'message' : "توکن بازیابی الزامی است",
                             'code' : "AUTH_TOKEN_MISSING"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'error' : False,
                             'message' : "با موفقیت خارج شدید",
                             'code' : 'AUTH_LOGOUT_SUCCESS'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error' : True,
                             'message' : "توکن معتبر نیست",
                             'code' : "AUTH_TOKEN_INVALID"}, status=status.HTTP_401_UNAUTHORIZED)


class Login(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)
        
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        rememberMe = serializer.validated_data['rememberMe']
        
        if username.endswith('iust.ac.ir'):
            username = User.objects.get(email=username).username
        
        user = authenticate(username=username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            if rememberMe:
                refresh.set_exp(lifetime=timedelta(days=7))
            return Response({'error' : False,
                             'message' : "با موفقیت وارد شدید",
                             'code' : 'AUTH_LOGIN_SUCCESS',
                             'data' : {'access' : str(refresh.access_token), 
                                       'refresh' : str(refresh)}}, status=status.HTTP_200_OK)
        
        return Response({'error' : True,
                         'message' : 'نام کاربری یا نام رمزعبور نامعتبر است',
                         'code' : 'AUTH_LOGIN_FAILED'}, status=status.HTTP_401_UNAUTHORIZED)