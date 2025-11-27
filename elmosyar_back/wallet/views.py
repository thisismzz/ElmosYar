from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import UserWallet, Transaction
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

