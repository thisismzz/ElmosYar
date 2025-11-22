from django.shortcuts import render, redirect
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status, generics
from rest_framework.views import APIView
from .serializers import SignUpSerializer, LoginSerializer, UserInfoSerializer
from .models import UserInfo
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import timedelta

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserInfoSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.profile


@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    serializer = SignUpSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_409_CONFLICT)


class Logout(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({'ERROR' : 'refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'SUCCESS' : 'logging out'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'ERROR' : 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
        
class Login(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)
        
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        rememberMe = serializer.validated_data['rememberMe']
        
        user = authenticate(username=username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            if rememberMe:
                refresh.set_exp(lifetime=timedelta(days=7))
            return Response({
                'access' : str(refresh.access_token),
                'refresh' : str(refresh)
            }, status=status.HTTP_200_OK)
        
        return Response({'ERROR' : 'invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)