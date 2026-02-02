from rest_framework import serializers
from .models import UserWallet, Transaction

class UserWalletSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserWallet
        fields = ['user', 'username', 'balance']
        

class TransactionSerializer(serializers.ModelSerializer):
    from_username = serializers.CharField(source='from_user.username', read_only=True)
    to_username = serializers.CharField(source='to_user.username', read_only=True)
    post_title = serializers.CharField(source='post.title', read_only=True, allow_null=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'wallet', 'amount', 'status', 'type', 
            'from_user', 'from_username', 'to_user', 'to_username',
            'registered_in', 'authority', 'post', 'post_title'
        ]
