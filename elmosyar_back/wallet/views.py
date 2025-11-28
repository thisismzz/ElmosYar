from django.shortcuts import render
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import UserWallet, Transaction, WalletService, WalletError, InsufficientBalance
from .serializer import UserWalletSerializer, TransactionSerializer
from rest_framework import status

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wallet(request):
    wallet = UserWallet.objects.get(user=request.user)
    serializer = UserWalletSerializer(wallet)
    return Response({"error": False,
                    "message": "کیف پول با موفقیت دریافت شد",
                    "code": "USER_WALLET_FETCHED",
                    "data": serializer.data}, status=status.HTTP_200_OK)


def wallet_service_handler(service, *args, **kwargs):
    try :
        message, code, data = service(*args, **kwargs)
        return Response({"error": False,
                         "message": message,
                         "code": code,
                         "data": data}, status=status.HTTP_200_OK)
        
    except InsufficientBalance as e:
        return Response({"error": True,
                         "message": str(e),
                         "code": "INSUFFICIENT_BALANCE"}, status=status.HTTP_400_BAD_REQUEST)
        
    except WalletError as e:
        return Response({"error": True,
                         "message": str(e),
                         "code": "SERVER_ERROR"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except ValueError as e:
        return Response({"error": True,
                         "message": "مقدار وارد شده نامعتبر است",
                         "code": "WALLET_INVALID_AMOUNT"}, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response({"error": True,
                         "message": "خطای غیر منتظره ای رخ داده",
                         "code": "UNEXPECTED_ERROR"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deposit(request):
    amount = request.data.get("amount")
    return wallet_service_handler(WalletService.deposit, request.user, amount)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def withdraw(request):
    amount = request.data.get("amount")
    return wallet_service_handler(WalletService.withdraw, request.user, amount)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def transfer(request):
    to_user_id = request.data.get("to_user_id")
    amount = request.data.get("amount")
    
    try :
        to_user = settings.AUTH_USER_MODEL.objects.get(pk=to_user_id)
    except settings.AUTH_USER_MODEL.DoesNotExists:
        return Response({"error": True,
                         "message": "کاربر وارد شده یافت نشد",
                         "code": "USER_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)
        
    return wallet_service_handler(WalletService.transfer, request.user, to_user, amount)