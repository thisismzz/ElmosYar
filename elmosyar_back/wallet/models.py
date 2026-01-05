from django.db import models
from django.conf import settings
from django.db import transaction
from posts.models import Post

User = settings.AUTH_USER_MODEL

class UserWallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    balance = models.IntegerField(blank=False, null=False, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s wallet"
    

class Transaction(models.Model):
    STATUS = [
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed')
    ]
    
    TYPE = [
        ('withdraw', 'Withdraw'),
        ('deposit', 'Deposit'),  # ✅ اصلاح املایی
        ('payment', 'Payment'),
        ('receive', 'Receive'),  # ✅ اصلاح املایی
        ('refund', 'Refund')
    ]
    
    wallet = models.ForeignKey(UserWallet, on_delete=models.CASCADE, related_name='transactions')
    amount = models.IntegerField(blank=False, null=False)
    registered_in = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS, default='pending')
    type = models.CharField(max_length=10, choices=TYPE)
    from_user = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name='paid_transactions')
    to_user = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name='received_transactions')
    is_processed = models.BooleanField(default=False)
    authority = models.CharField(max_length=100, null=True, blank=True)
    post = models.ForeignKey(Post, on_delete=models.SET_NULL, blank=True, null=True, related_name='transactions')  # ✅ تغییر به ForeignKey
    
    def __str__(self):
        return str(self.id)
    

class WalletError(Exception):
    pass

class InsufficientBalance(Exception):
    pass

class WalletService:

    @staticmethod
    @transaction.atomic
    def deposit(user, amount):
        try:
            # اعتبارسنجی مقدار
            if amount <= 0:
                raise ValueError("مقدار باید مثبت باشد")
            
            wallet = UserWallet.objects.select_for_update().get(user=user)
            wallet.balance += amount
            wallet.save()

            Transaction.objects.create(
                wallet=wallet,
                amount=amount,
                type="deposit",
                status="success",
                from_user=user,
                to_user=user  # ✅ اضافه کردن to_user
            )
            
            return f"مبلغ {amount} به با موفقیت کیف پول شما اضافه شد", "DEPOSIT_SUCCESS", {"balance" : wallet.balance}
        
        except UserWallet.DoesNotExist:
           raise WalletError("کیف پول یافت نشد")
        except ValueError as e:
            raise WalletError(str(e))
        except Exception as e:
            raise WalletError("مشکلی پیش آمده لطفا دوباره سعی کنید") from e
    
    @staticmethod
    @transaction.atomic
    def withdraw(user, amount):
        try:
            # اعتبارسنجی مقدار
            if amount <= 0:
                raise ValueError("مقدار باید مثبت باشد")
            
            wallet = UserWallet.objects.select_for_update().get(user=user)

            if wallet.balance < amount:
                raise InsufficientBalance("موجودی کافی نمیباشد")

            wallet.balance -= amount
            wallet.save()

            Transaction.objects.create(
                wallet=wallet,
                amount=amount,
                type="withdraw",
                status="success",
                from_user=user,
                to_user=user  # ✅ اضافه کردن to_user
            )

            return f"مبلغ {amount} با موفقیت از کیف پول شما کسر شد", "WITHDRAW_SUCCESS", {"balance" : wallet.balance}
        
        except UserWallet.DoesNotExist:
            raise WalletError("کیف پول یافت نشد")
        except InsufficientBalance:
            raise
        except ValueError as e:
            raise WalletError(str(e))
        except Exception as e:
            raise WalletError("مشکلی پیش آمده لطفا دوباره سعی کنید") from e
    
    @staticmethod
    @transaction.atomic
    def purchase_or_transfer(from_user, to_user, amount, is_purchase=False, authority=None, post=None):
        try:
            # اعتبارسنجی مقدار
            if amount <= 0:
                raise ValueError("مقدار باید مثبت باشد")
            
            # جلوگیری از transfer به خود
            if from_user.id == to_user.id:
                raise WalletError("امکان انتقال به خود وجود ندارد")
            
            wallets = (UserWallet.objects.select_for_update().filter(user_id__in=sorted([from_user.id, to_user.id])))
            sender_wallet = next(w for w in wallets if w.user.id == from_user.id)
            receiver_wallet = next(w for w in wallets if w.user.id != from_user.id)
            
            if sender_wallet.balance < amount:
                raise InsufficientBalance("موجودی کافی نمیباشد")

            sender_wallet.balance -= amount
            receiver_wallet.balance += amount

            sender_wallet.save()
            receiver_wallet.save()

            if authority is not None:
                try:
                    transac = Transaction.objects.select_for_update().get(
                        from_user=from_user,
                        authority=authority,
                        status='pending'
                    )
                    transac.status = "success"
                    transac.is_processed = True
                    transac.save()
                except Transaction.DoesNotExist:
                    raise WalletError("تراکنش مورد نظر یافت نشد یا قبلا پردازش شده")
            
            else:
                Transaction.objects.create(
                    wallet=sender_wallet,
                    amount=amount,
                    type="payment",
                    status="success",
                    from_user=from_user,
                    to_user=to_user,
                    post=post
                )
            
            Transaction.objects.create(
                wallet=receiver_wallet,
                amount=amount,
                type="receive",  # ✅ اصلاح املایی
                status="success",
                from_user=from_user,
                to_user=to_user,
                post=post
            )
            
            if is_purchase:
                return f"خرید با موفقیت انجام شد", "PURCHASE_SUCCESS", {"balance" : sender_wallet.balance}
            
            return f"مبلغ {amount} با موفقیت منتقل شد", "TRANSFER_SUCCESS", {"balance" : sender_wallet.balance}

        except InsufficientBalance:
            raise
        except Exception as e:
            raise WalletError(f"مشکلی پیش آمده: {str(e)}") from e