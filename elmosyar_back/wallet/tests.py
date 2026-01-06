from django.test import TestCase
from django.contrib.auth import get_user_model
from posts.models import Post
from .models import UserWallet, Transaction, WalletService, InsufficientBalance, WalletError


User = get_user_model()

class WalletServiceTest(TestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(username="mahdi1", password="1234")
        self.user2 = User.objects.create_user(username="mahdi2", password="5678")
        self.wallet1 = UserWallet.objects.create(user=self.user1, balance=1000)
        self.wallet2 = UserWallet.objects.create(user=self.user2, balance=500)

    def test_deposit(self):
        WalletService.deposit(self.user1, 500)
        self.wallet1.refresh_from_db()
        self.assertEqual(self.wallet1.balance, 1500)

    def test_deposit_negative_amount(self):
        with self.assertRaises(WalletError):
            WalletService.deposit(self.user1, -100)

    def test_deposit_zero_amount(self):
        with self.assertRaises(WalletError):
            WalletService.deposit(self.user1, 0)

    def test_withdraw_success(self):
        WalletService.withdraw(self.user1, 700)
        self.wallet1.refresh_from_db()
        self.assertEqual(self.wallet1.balance, 300)

    def test_withdraw_insufficient_balance(self):
        with self.assertRaises(InsufficientBalance):
            WalletService.withdraw(self.user1, 1500)

    def test_transfer_success(self):
        WalletService.purchase_or_transfer(self.user1, self.user2, 300)
        self.wallet1.refresh_from_db()
        self.wallet2.refresh_from_db()
        self.assertEqual(self.wallet1.balance, 700)
        self.assertEqual(self.wallet2.balance, 800)

    def test_transfer_insufficient_balance(self):
        with self.assertRaises(InsufficientBalance):
            WalletService.purchase_or_transfer(self.user1, self.user2, 2000)

    def test_transfer_to_self(self):
        with self.assertRaises(WalletError):
            WalletService.purchase_or_transfer(self.user1, self.user1, 100)

    def test_concurrent_transactions(self):
        import threading
        
        def deposit_100():
            WalletService.deposit(self.user1, 100)
        
        threads = []
        for _ in range(10):
            t = threading.Thread(target=deposit_100)
            threads.append(t)
            t.start()
        
        for t in threads:
            t.join()
        
        self.wallet1.refresh_from_db()
        self.assertEqual(self.wallet1.balance, 2000)

    def test_transaction_creation_on_deposit(self):
        initial_count = Transaction.objects.count()
        WalletService.deposit(self.user1, 200)
        final_count = Transaction.objects.count()
        self.assertEqual(final_count, initial_count + 1)
        
        transaction = Transaction.objects.last()
        self.assertEqual(transaction.amount, 200)
        self.assertEqual(transaction.type, 'deposit')
        self.assertEqual(transaction.status, 'success')

    def test_purchase_flow(self):
        post = Post.objects.create(
            author=self.user2,
            title="Test Post",
            attributes={"price": 300, "isSoldOut": False}
        )
        
        WalletService.purchase_or_transfer(
            self.user1, 
            self.user2, 
            300, 
            is_purchase=True, 
            post=post
        )
        
        self.wallet1.refresh_from_db()
        self.wallet2.refresh_from_db()
        self.assertEqual(self.wallet1.balance, 700)
        self.assertEqual(self.wallet2.balance, 800)
        
        payment_transaction = Transaction.objects.filter(
            wallet=self.wallet1, 
            type='payment'
        ).first()
        receive_transaction = Transaction.objects.filter(
            wallet=self.wallet2, 
            type='receive'
        ).first()
        
        self.assertIsNotNone(payment_transaction)
        self.assertIsNotNone(receive_transaction)
        self.assertEqual(payment_transaction.amount, 300)
        self.assertEqual(receive_transaction.amount, 300)

