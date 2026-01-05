from django.db import models
from django.conf import settings
import os


class Category(models.Model):
    name = models.CharField(max_length=255, unique=True, db_index=True)
    anonymous = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'category'
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name


class Post(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='replies')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    mentions = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='mentioned_in_posts', blank=True)
    is_repost = models.BooleanField(default=False)
    original_post = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='reposts')
    saved_by = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='saved_posts', blank=True)
    attributes = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category', 'created_at']),
            models.Index(fields=['author', 'created_at']),
        ]
        db_table = 'post'

    def __str__(self):
        return f"Post by {self.author} at {self.created_at}"[:50]

    @property
    def likes_count(self):
        return self.reactions.filter(reaction='like').count()

    @property
    def dislikes_count(self):
        return self.reactions.filter(reaction='dislike').count()

    @property
    def comments_count(self):
        return self.comments.count()
    
    @property
    def is_anonymous(self):
        """بررسی می‌کند آیا پست در یک کتگوری ناشناس است یا نه"""
        return self.category and self.category.anonymous
    
    @property
    def visible_author(self):
        """نویسنده قابل مشاهده (برای کتگوری‌های ناشناس None برمی‌گرداند)"""
        return None if self.is_anonymous else self.author
    
    @property
    def visible_mentions(self):
        """Mentions قابل مشاهده (برای کتگوری‌های ناشناس لیست خالی برمی‌گرداند)"""
        return [] if self.is_anonymous else list(self.mentions.all())

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)


class PostMedia(models.Model):
    MEDIA_TYPE_CHOICES = [
        ("image", "Image"),
        ("video", "Video"),
        ("audio", "Audio"),
        ("file", "File"),
    ]
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='media')
    file = models.FileField(upload_to='posts/media/')
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    caption = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'created_at']
        db_table = 'postmedia'

    def __str__(self):
        return f"Media for post {self.post_id} ({self.media_type})"

    def delete(self, *args, **kwargs):
        if self.file:
            if os.path.isfile(self.file.path):
                os.remove(self.file.path)
        super().delete(*args, **kwargs)


class CategoryFormat(models.Model):
    category = models.CharField(max_length=255, unique=True, db_index=True)
    format_file = models.FileField(upload_to='category_formats/')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'category_format'

    def __str__(self):
        return f"Format for {self.category}"

    def delete(self, *args, **kwargs):
        if self.format_file:
            if os.path.isfile(self.format_file.path):
                os.remove(self.format_file.path)
        super().delete(*args, **kwargs)