from django.urls import path
from . import views

urlpatterns = [
    path('mywallet/', views.get_wallet, name='user_wallet')
]