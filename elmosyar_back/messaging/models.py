from django.db import models
from django.conf import settings


class Conversation(models.Model):
    """مدل جدید برای مکالمات خصوصی"""
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        db_table = 'conversation'

    def __str__(self):
        return f"Conversation {self.id}"


class Message(models.Model):
    """مدل جدید برای پیام‌های خصوصی"""
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField(max_length=2000)
    image = models.ImageField(upload_to='messages/images/', blank=True, null=True)
    file = models.FileField(upload_to='messages/files/', blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', 'is_read', 'created_at']),
        ]
        db_table = 'message'

    def __str__(self):
        return f"Message from {self.sender} in {self.conversation.id}"

    def mark_as_read(self):
        """علامت‌گذاری پیام به عنوان خوانده شده"""
        self.is_read = True
        self.save()