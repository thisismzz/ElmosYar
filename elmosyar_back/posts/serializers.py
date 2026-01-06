from rest_framework import serializers
from accounts.serializers import UserSerializer
from .models import Post, PostMedia, CategoryFormat, Category


class PostMediaSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()

    class Meta:
        model = PostMedia
        fields = ['id', 'url', 'media_type', 'caption', 'order', 'file_size']

    def get_url(self, obj):
        return obj.file.url if obj.file else ''

    def get_file_size(self, obj):
        return obj.file.size if obj.file else 0


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'anonymous', 'created_at', 'updated_at']


class PostSerializer(serializers.ModelSerializer):
    # ✅ تغییر author به SerializerMethodField برای کنترل نمایش
    author = serializers.SerializerMethodField()
    author_info = serializers.SerializerMethodField()
    media = PostMediaSerializer(many=True, read_only=True)
    mentions = serializers.SerializerMethodField()
    category_info = CategorySerializer(source='category', read_only=True)
    likes_count = serializers.SerializerMethodField()
    dislikes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    reposts_count = serializers.SerializerMethodField()
    replies_count = serializers.SerializerMethodField()
    user_reaction = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    attributes = serializers.JSONField(default=dict, required=False)

    class Meta:
        model = Post
        fields = [
            'id', 'author', 'author_info', 'created_at', 'updated_at',
            'mentions', 'media', 'category', 'category_info', 'parent', 'is_repost',
            'original_post', 'likes_count', 'dislikes_count', 'comments_count',
            'reposts_count', 'replies_count', 'user_reaction', 'is_saved', 'attributes'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_author(self, obj):
        """
        بازگرداندن آیدی نویسنده فقط اگر کتگوری ناشناس نباشد
        """
        request = self.context.get('request')
        if obj.category and obj.category.anonymous:
            # اگر کتگوری ناشناس باشد، author را مخفی کن
            return None
        
        return obj.author.id

    def get_author_info(self, obj):
        """
        بازگرداندن اطلاعات کامل نویسنده فقط اگر کتگوری ناشناس نباشد
        """
        request = self.context.get('request')
        if obj.category and obj.category.anonymous:
            # اگر کتگوری ناشناس باشد، اطلاعات نویسنده را مخفی کن
            return None
        
        # در غیر این صورت اطلاعات کامل را برگردان
        return UserSerializer(obj.author, context=self.context).data

    def get_mentions(self, obj):
        """
        بازگرداندن mentions فقط اگر کتگوری ناشناس نباشد
        """
        request = self.context.get('request')
        if obj.category and obj.category.anonymous:
            # اگر کتگوری ناشناس باشد، mentions را مخفی کن
            return []
        
        return UserSerializer(obj.mentions.all(), many=True, context=self.context).data

    def get_likes_count(self, obj):
        return obj.reactions.filter(reaction='like').count()

    def get_dislikes_count(self, obj):
        return obj.reactions.filter(reaction='dislike').count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_reposts_count(self, obj):
        return Post.objects.filter(original_post=obj, is_repost=True).count()

    def get_replies_count(self, obj):
        return obj.replies.count()

    def get_user_reaction(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            reaction = obj.reactions.filter(user=request.user).first()
            return reaction.reaction if reaction else None
        return None

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.saved_by.filter(id=request.user.id).exists()
        return False


class CategoryFormatSerializer(serializers.ModelSerializer):
    created_by_info = UserSerializer(source='created_by', read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = CategoryFormat
        fields = ['id', 'category', 'format_file', 'file_url', 'created_by', 'created_by_info', 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def get_file_url(self, obj):
        return obj.format_file.url if obj.format_file else ''