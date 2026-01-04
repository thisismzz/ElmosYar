from django.urls import path
from . import views

urlpatterns = [
    path('mywallet/', views.get_wallet, name='user_wallet'),
    path('deposit/', views.deposit, name='wallet-deposit'),
    path('withdraw/', views.withdraw, name='wallet-withdraw'),
    path('transfer/', views.transfer, name='wallet-transfer'),
    path('purchase/<int:post_id>/', views.purchase, name='post_purchase'),
    path('transactions/', views.user_transactions, name='user-transactions'),
    path('payment/create/<int:post_id>/', views.create_payment, name='create_payment_gateway'),
    path('payment/verify/', views.verify_payment, name='verify_payment'),
    path('purchases/', views.get_purchased_posts,name='get_purchased_posts'),
    path('sales/', views.get_sold_posts, name="get_sold_posts")
]
