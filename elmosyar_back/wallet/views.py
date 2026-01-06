import uuid
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from django.db import transaction as db_transaction
from posts.models import Post
from posts.serializers import PostSerializer
from django.conf import settings
from .models import UserWallet, Transaction, WalletService, WalletError, InsufficientBalance
from .serializer import UserWalletSerializer, TransactionSerializer

# جایگزین کردن لاگر قدیمی
from log_manager.log_config import log_info, log_error, log_warning, log_audit

User = settings.AUTH_USER_MODEL

# تابع کمکی برای اعتبارسنجی amount
def validate_amount(amount, max_amount=1000000000):
    try:
        amount = int(amount)
        if amount <= 0:
            raise ValueError("مقدار باید مثبت باشد")
        if amount > max_amount:
            raise ValueError(f"مقدار نمی‌تواند بیشتر از {max_amount:,} باشد")
        return amount
    except (ValueError, TypeError):
        raise ValueError("مقدار نامعتبر است. لطفا یک عدد وارد کنید")

# تابع کمکی برای بررسی شرایط خرید پست
def validate_purchase_post(post, user):
    if post.author.id == user.id:
        raise ValueError("امکان خرید توسط فروشنده وجود ندارد")
    
    if post.attributes.get('isSoldOut') == True:
        raise ValueError("این آیتم قبلا به فروش رفته است")
    
    price = post.attributes.get('price')
    if price is None:
        raise ValueError("قیمت یافت نشد")
    
    return int(price)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wallet(request):
    try:
        wallet = UserWallet.objects.get(user=request.user)
    except UserWallet.DoesNotExist:
        log_warning(f"Wallet not found for user {request.user.username}", request)
        return Response({"error": True,
                         "message": "کیف پول یافت نشد",
                         "code": "USER_WALLET_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)
        
    log_info(f"User viewed wallet", request, {
        'balance': wallet.balance,
        'wallet_id': wallet.id
    })
    
    serializer = UserWalletSerializer(wallet)
    return Response({"error": False,
                    "message": "کیف پول با موفقیت دریافت شد",
                    "code": "USER_WALLET_FETCHED",
                    "data": serializer.data}, status=status.HTTP_200_OK)


def wallet_service_handler(service, *args, **kwargs):
    """Handler for wallet services with logging"""
    request = args[0] if len(args) > 0 and hasattr(args[0], 'user') else None
    
    try:
        message, code, data = service(*args, **kwargs)
        
        # Log successful operation
        service_name = service.__name__  # ✅ استفاده از attribute درست
        
        if service_name == 'deposit':
            log_audit(f"Wallet deposit successful", request, {
                'amount': kwargs.get('amount') if 'amount' in kwargs else args[1],
                'new_balance': data.get('balance') if data else None
            })
        elif service_name == 'withdraw':
            log_audit(f"Wallet withdrawal successful", request, {
                'amount': kwargs.get('amount') if 'amount' in kwargs else args[1],
                'new_balance': data.get('balance') if data else None
            })
        elif service_name == 'purchase_or_transfer':
            log_audit(f"Wallet transfer/purchase successful", request, {
                'amount': kwargs.get('amount') if 'amount' in kwargs else args[2],
                'to_user': args[1].username if len(args) > 1 else None,
                'new_balance': data.get('balance') if data else None
            })
        
        return Response({"error": False,
                         "message": message,
                         "code": code,
                         "data": data}, status=status.HTTP_200_OK)
        
    except InsufficientBalance as e:
        log_warning(f"Insufficient balance for wallet operation", request, {
            'service': service.__name__,
            'error': str(e)
        })
        return Response({"error": True,
                         "message": str(e),
                         "code": "INSUFFICIENT_BALANCE"}, status=status.HTTP_409_CONFLICT)
        
    except WalletError as e:
        log_error(f"Wallet error: {str(e)}", request, {
            'service': service.__name__
        })
        return Response({"error": True,
                         "message": str(e),
                         "code": "WALLET_ERROR"}, status=status.HTTP_400_BAD_REQUEST)
        
    except ValueError as e:
        log_warning(f"Invalid amount for wallet operation: {str(e)}", request, {
            'service': service.__name__
        })
        return Response({"error": True,
                         "message": str(e),
                         "code": "INVALID_AMOUNT"}, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        log_error(f"Unexpected wallet error: {str(e)}", request, {
            'service': service.__name__
        })
        return Response({"error": True,
                         "message": "خطای غیر منتظره ای رخ داده",
                         "code": "UNEXPECTED_ERROR"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deposit(request):
    """Deposit money to wallet"""
    amount = request.data.get("amount")
    log_info(f"Wallet deposit request: {amount}", request)
    
    try:
        amount = validate_amount(amount)
    except ValueError as e:
        return Response({"error": True,
                         "message": str(e),
                         "code": "INVALID_AMOUNT"}, status=status.HTTP_400_BAD_REQUEST)
    
    return wallet_service_handler(WalletService.deposit, request.user, amount)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def withdraw(request):
    """Withdraw money from wallet"""
    amount = request.data.get("amount")
    log_info(f"Wallet withdrawal request: {amount}", request)
    
    try:
        amount = validate_amount(amount)
    except ValueError as e:
        return Response({"error": True,
                         "message": str(e),
                         "code": "INVALID_AMOUNT"}, status=status.HTTP_400_BAD_REQUEST)
    
    return wallet_service_handler(WalletService.withdraw, request.user, amount)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def transfer(request):
    """Transfer money to another user"""
    to_user_id = request.data.get("to_user_id")
    amount = request.data.get("amount")
    
    log_info(f"Wallet transfer request: {amount} to user {to_user_id}", request)
    
    try:
        amount = validate_amount(amount)
    except ValueError as e:
        return Response({"error": True,
                         "message": str(e),
                         "code": "INVALID_AMOUNT"}, status=status.HTTP_400_BAD_REQUEST)
    
    # جلوگیری از transfer به خود
    if to_user_id == request.user.id:
        return Response({"error": True,
                         "message": "امکان انتقال به خود وجود ندارد",
                         "code": "SELF_TRANSFER_NOT_ALLOWED"}, 
                         status=status.HTTP_400_BAD_REQUEST)
        
    try:
        to_user = User.objects.get(pk=to_user_id)
    except User.DoesNotExist:
        log_warning(f"Transfer to non-existent user: {to_user_id}", request)
        return Response({"error": True,
                         "message": "کاربر وارد شده یافت نشد",
                         "code": "USER_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)
        
    return wallet_service_handler(WalletService.purchase_or_transfer, request.user, to_user, amount)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_transactions(request):
    """Get user's transaction history"""
    try:
        wallet = UserWallet.objects.get(user=request.user)
    except UserWallet.DoesNotExist:
        log_warning(f"Transactions requested for non-existent wallet", request)
        return Response({"error": True,
                         "message": "کیف پول یافت نشد",
                         "code": "USER_WALLET_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)
        
    # ✅ بهینه‌سازی query با select_related
    transactions = Transaction.objects.filter(
        wallet=wallet
    ).select_related(
        'wallet', 'from_user', 'to_user', 'post'
    ).order_by('-registered_in')
    
    if not transactions.exists():
        log_info(f"No transactions found for user", request)
        return Response({"error": True,
                         "message": "تراکنشی وجود ندارد",
                         "code": "USER_TRANSACTION_NOT_EXIST"}, status=status.HTTP_200_OK)
    
    log_info(f"User viewed transactions history ({transactions.count()} transactions)", request)
    
    serializer = TransactionSerializer(transactions, many=True)
    return Response({"error": False,
                     "message": "تراکنش های کاربر یافت شد",
                     "code": "USER_TRANSACTION_FETCHED",
                     "data": serializer.data}, status=status.HTTP_200_OK)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def purchase(request, post_id):
    """Purchase a post/item"""
    try:
        with db_transaction.atomic():
            # ✅ Lock کردن پست برای جلوگیری از race condition
            post = Post.objects.select_for_update().get(id=post_id)
            
            try:
                price = validate_purchase_post(post, request.user)
            except ValueError as e:
                return Response({"error": True,
                                "message": str(e),
                                "code": "PURCHASE_VALIDATION_FAILED"}, 
                                status=status.HTTP_400_BAD_REQUEST)
            
            log_info(f"Purchase request for post {post_id} at price {price}", request, {
                'post_author': post.author.username,
                'price': price
            })
            
            response = wallet_service_handler(
                WalletService.purchase_or_transfer,
                request.user,
                post.author,
                price,
                True,
                post=post
            )

            if response.status_code == 200:
                attrs = post.attributes.copy()
                attrs["isSoldOut"] = True
                post.attributes = attrs
                post.save(update_fields=["attributes"])
                
                log_audit(f"Post purchased successfully", request, {
                    'post_id': post_id,
                    'price': price,
                    'seller': post.author.username
                })

            return response
            
    except Post.DoesNotExist:
        log_warning(f"Purchase attempt for non-existent post: {post_id}", request)
        return Response({"error": True,
                         "message": "پست مورد نظر یافت نشد",
                         "code": "POST_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        log_error(f"Error in purchase process: {str(e)}", request)
        return Response({"error": True,
                         "message": "خطا در فرآیند خرید",
                         "code": "PURCHASE_PROCESS_ERROR"}, 
                         status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment(request, post_id):
    """Create payment gateway for post purchase"""
    try:
        post = Post.objects.get(id=post_id)
        
        try:
            price = validate_purchase_post(post, request.user)
        except ValueError as e:
            return Response({"error": True,
                            "message": str(e),
                            "code": "PAYMENT_VALIDATION_FAILED"}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        log_info(f"Payment creation request for post {post_id} at price {price}", request, {
            'post_author': post.author.username,
            'price': price
        })
        
        wallet = UserWallet.objects.get(user=request.user)
        
        # ✅ ساخت authority ایمن
        authority = f"{uuid.uuid4()}-{post.pk}"
        
        transac = Transaction.objects.create(
            wallet=wallet,
            amount=price,
            status="pending",
            type="payment",
            from_user=request.user,
            to_user=post.author,
            authority=authority,
            post=post
        )
        
        return Response({"error": False,
                         "message": "لینک پرداخت با موفقیت ساخته شد",
                         "code": "PAYMENT_CREATED",
                         "data": {
                             "payment_url": f"/payment/gateway/{transac.authority}/",
                             "authority": transac.authority,
                             "amount": price
                         }})
        
    except Post.DoesNotExist:
        log_warning(f"Payment creation for non-existent post: {post_id}", request)
        return Response({"error": True,
                         "message": "پست مورد نظر یافت نشد",
                         "code": "POST_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)
    except UserWallet.DoesNotExist:
        log_warning(f"Payment creation for user without wallet", request)
        return Response({"error": True,
                         "message": "کیف پول یافت نشد",
                         "code": "USER_WALLET_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)


def fake_payment_status_generator():
    """Fake payment status for development"""
    import random
    # در production باید با gateway واقعی جایگزین شود
    return random.choice([True, True, False])  # 66% success rate for testing


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    """Verify payment with gateway"""
    authority = request.data.get("authority")
    
    if not authority:
        return Response({"error": True,
                         "message": "شناسه پرداخت وارد نشده",
                         "code": "PAYMENT_VERIFICATION_FAILED"}, 
                         status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # ✅ استفاده از select_for_update برای جلوگیری از race condition
        transac = Transaction.objects.select_for_update().get(
            authority=authority, 
            from_user=request.user,
            status='pending'
        )
        
        if transac.is_processed:
            return Response({"error": True,
                             "message": "این تراکنش قبلا پردازش شده است",
                             "code": "PAYMENT_ALREADY_PROCESSED"}, 
                             status=status.HTTP_410_GONE)
        
        # در production: ارتباط با درگاه پرداخت واقعی
        payment_result = fake_payment_status_generator()
        
        if payment_result:
            # ✅ استفاده از post از طریق رابطه
            response = wallet_service_handler(
                WalletService.purchase_or_transfer,
                request.user,
                transac.to_user,
                transac.amount,
                True,
                authority=transac.authority,
                post=transac.post
            )

            if response.status_code == 200 and transac.post:
                post = transac.post
                attrs = post.attributes.copy()
                attrs["isSoldOut"] = True
                post.attributes = attrs
                post.save(update_fields=["attributes"])

                log_audit(f"Post purchased via payment gateway", request, {
                    'post_id': post.id,
                    'price': transac.amount,
                    'seller': post.author.username
                })

            return response
        else:
            transac.status = "failed"
            transac.save()
            
            log_warning(f"Payment failed for authority: {authority}", request)
            return Response({"error": True,
                             "message": "پرداخت موفقیت آمیز نبود",
                             "code": "PAYMENT_FAILED"}, 
                             status=status.HTTP_200_OK)
            
    except Transaction.DoesNotExist:
        log_warning(f"Invalid payment authority: {authority}", request)
        return Response({"error": True,
                         "message": "اطلاعات پرداخت معتبر نیست",
                         "code": "PAYMENT_VERIFICATION_FAILED"}, 
                         status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_purchased_posts(request):
    """Get user's purchased posts"""
    try:
        wallet = UserWallet.objects.get(user=request.user)
    except UserWallet.DoesNotExist:
        log_warning(f"Purchased posts requested for non-existent wallet", request)
        return Response({"error": True,
                         "message": "کیف پول یافت نشد",
                         "code": "USER_WALLET_NOT_FOUND"}, 
                         status=status.HTTP_404_NOT_FOUND)
        
    # ✅ اصلاح type به "payment" (با توجه به اصلاح مدل)
    posts = Post.objects.filter(
        transactions__wallet=wallet, 
        transactions__type="payment",
        transactions__status="success"
    ).distinct()
    
    if not posts.exists():
        log_info(f"No purchased posts found for user", request)
        return Response({"error": True,
                         "message": "پست خریداری شده‌ای وجود ندارد",
                         "code": "NO_PURCHASED_POSTS"}, 
                         status=status.HTTP_200_OK)
    
    log_info(f"User viewed purchased posts ({posts.count()} posts)", request)
    
    serializer = PostSerializer(posts, many=True)
    return Response({"error": False,
                     "message": "پست های خریداری شده کاربر یافت شد",
                     "code": "PURCHASED_POSTS_FETCHED",
                     "data": serializer.data}, 
                     status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_sold_posts(request):
    """Get user's sold posts"""
    try:
        wallet = UserWallet.objects.get(user=request.user)
    except UserWallet.DoesNotExist:
        log_warning(f"Sold posts requested for non-existent wallet", request)
        return Response({"error": True,
                         "message": "کیف پول یافت نشد",
                         "code": "USER_WALLET_NOT_FOUND"}, 
                         status=status.HTTP_404_NOT_FOUND)
        
    # ✅ اصلاح type به "receive" (با توجه به اصلاح مدل)
    posts = Post.objects.filter(
        author=request.user,
        transactions__type="receive",
        transactions__status="success"
    ).distinct()
    
    if not posts.exists():
        log_info(f"No sold posts found for user", request)
        return Response({"error": True,
                         "message": "پست فروخته شده‌ای وجود ندارد",
                         "code": "NO_SOLD_POSTS"}, 
                         status=status.HTTP_200_OK)
    
    log_info(f"User viewed sold posts ({posts.count()} posts)", request)
    
    serializer = PostSerializer(posts, many=True)
    return Response({"error": False,
                     "message": "پست های فروخته شده کاربر یافت شد",
                     "code": "SOLD_POSTS_FETCHED",
                     "data": serializer.data}, 
                     status=status.HTTP_200_OK)