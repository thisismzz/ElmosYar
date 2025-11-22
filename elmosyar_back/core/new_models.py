from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.mail import send_mail
from django.conf import settings
import uuid
import os
from datetime import timedelta
from django.utils import timezone

class User(AbstractUser):
    email = models.EmailField(unique=True)
    student_id = models.CharField(max_length=20, blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True, null=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    is_email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=255, blank=True, null=True)
    email_verification_sent_at = models.DateTimeField(blank=True, null=True)
    password_reset_token = models.CharField(max_length=255, blank=True, null=True)
    password_reset_sent_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    followers = models.ManyToManyField(
        'self', 
        symmetrical=False, 
        related_name='following', 
        blank=True,
        through='UserFollow'
    )

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        db_table = 'core_user'

    def __str__(self):
        return self.username

    def generate_email_verification_token(self):
        """تولید توکن برای تأیید ایمیل"""
        self.email_verification_token = str(uuid.uuid4())
        self.email_verification_sent_at = timezone.now()
        self.save()
        return self.email_verification_token

    def generate_password_reset_token(self):
        """تولید توکن برای ریست پسورد"""
        self.password_reset_token = str(uuid.uuid4())
        self.password_reset_sent_at = timezone.now()
        self.save()
        return self.password_reset_token

    def verify_email(self):
        """تأیید ایمیل کاربر"""
        self.is_email_verified = True
        self.email_verification_token = None
        self.email_verification_sent_at = None
        self.save()

    def is_password_reset_token_valid(self):
        """بررسی معتبر بودن توکن ریست پسورد"""
        if not self.password_reset_sent_at:
            return False
        return timezone.now() - self.password_reset_sent_at <= timedelta(hours=1)

    def is_email_verification_token_valid(self):
        """بررسی معتبر بودن توکن تأیید ایمیل"""
        if not self.email_verification_sent_at:
            return False
        return timezone.now() - self.email_verification_sent_at <= timedelta(hours=24)

    def follow(self, user):
        """فالو کردن کاربر دیگر"""
        if user != self and not self.following.filter(id=user.id).exists():
            UserFollow.objects.create(follower=self, following=user)
            return True
        return False

    def unfollow(self, user):
        """آنفالو کردن کاربر"""
        try:
            follow_relation = UserFollow.objects.get(follower=self, following=user)
            follow_relation.delete()
            return True
        except UserFollow.DoesNotExist:
            return False

    @property
    def followers_count(self):
        """تعداد فالوورها"""
        return UserFollow.objects.filter(following=self).count()

    @property
    def following_count(self):
        """تعداد افرادی که کاربر فالو کرده"""
        return UserFollow.objects.filter(follower=self).count()

    @property
    def posts_count(self):
        """تعداد پست‌های کاربر"""
        return self.posts.count()


class UserFollow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='follow_relations')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='follower_relations')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')
        db_table = 'core_user_followers'

    def __str__(self):
        return f"{self.follower} follows {self.following}"


class Chat(models.Model):
    """مدل پایه برای انواع چت‌ها"""
    CHAT_TYPE_CHOICES = [
        ('private', 'Private'),
        ('group', 'Group'),
        ('channel', 'Channel'),
    ]
    
    VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('private', 'Private'),
    ]
    
    type = models.CharField(max_length=10, choices=CHAT_TYPE_CHOICES, default='private')
    visibility = models.CharField(max_length=10, choices=VISIBILITY_CHOICES, default='private')
    
    # اطلاعات پایه
    title = models.CharField(max_length=255, blank=True, null=True)
    username = models.CharField(max_length=100, blank=True, null=True, unique=True)  # برای چت‌های عمومی
    description = models.TextField(blank=True, null=True)
    photo = models.ImageField(upload_to='chats/', blank=True, null=True)
    
    # تنظیمات حریم خصوصی
    invite_link = models.CharField(max_length=255, blank=True, null=True)
    invite_link_enabled = models.BooleanField(default=True)
    participants_count = models.PositiveIntegerField(default=0)
    
    # تنظیمات گروه/کانال
    is_verified = models.BooleanField(default=False)  # برای کانال‌های رسمی
    is_restricted = models.BooleanField(default=False)  # محدود شده توسط ادمین‌ها
    linked_chat = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)  # برای اتصال گروه و کانال
    
    # تنظیمات ارسال پیام
    anyone_can_send_messages = models.BooleanField(default=True)  # برای گروه‌ها
    anyone_can_add_members = models.BooleanField(default=False)  # برای گروه‌ها
    slow_mode_delay = models.PositiveIntegerField(default=0)  # تأخیر بین ارسال پیام (ثانیه)
    
    # اطلاعات زمانی
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    migrated_from = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='migrated_to')  # برای گروه‌های آپگرید شده

    class Meta:
        db_table = 'core_chat'
        indexes = [
            models.Index(fields=['type', 'visibility']),
            models.Index(fields=['username']),
            models.Index(fields=['is_verified']),
        ]

    def __str__(self):
        if self.type == 'private':
            participants = self.participants.all()[:2]
            if participants.count() == 2:
                return f"Private chat: {participants[0]} & {participants[1]}"
        
        visibility_str = "Public" if self.visibility == 'public' else "Private"
        return f"{visibility_str} {self.get_type_display()}: {self.title}"

    @property
    def is_public(self):
        return self.visibility == 'public'
    
    @property
    def is_private(self):
        return self.visibility == 'private'
    
    @property
    def is_group(self):
        return self.type == 'group'
    
    @property
    def is_channel(self):
        return self.type == 'channel'
    
    def can_join_by_username(self, user):
        """آیا کاربر می‌تواند با نام کاربری به چت بپیوندد؟"""
        if not self.is_public:
            return False
        
        if self.is_restricted:
            return False
            
        # بررسی اینکه کاربر قبلاً عضو نیست
        return not self.members.filter(user=user).exists()
    
    def get_invite_link(self):
        """دریافت لینک دعوت"""
        if not self.invite_link_enabled:
            return None
            
        if self.invite_link:
            return self.invite_link
            
        # تولید لینک دعوت در صورت عدم وجود
        self.invite_link = f"https://t.me/{self.username}" if self.username else f"https://t.me/joinchat/{uuid.uuid4().hex}"
        self.save()
        return self.invite_link
    
    def update_participants_count(self):
        """بروزرسانی تعداد اعضا"""
        count = self.members.count()
        if self.participants_count != count:
            self.participants_count = count
            self.save()


class ChatPermissions(models.Model):
    """مدل برای تنظیمات دسترسی پیشرفته"""
    chat = models.OneToOneField(Chat, on_delete=models.CASCADE, related_name='permissions')
    
    # دسترسی‌های عمومی
    can_send_messages = models.BooleanField(default=True)
    can_send_media = models.BooleanField(default=True)
    can_send_polls = models.BooleanField(default=True)
    can_send_stickers = models.BooleanField(default=True)
    can_send_gifs = models.BooleanField(default=True)
    can_send_games = models.BooleanField(default=True)
    can_use_inline_bots = models.BooleanField(default=True)
    can_add_web_page_previews = models.BooleanField(default=True)
    
    # دسترسی‌های مدیریتی
    can_change_info = models.BooleanField(default=False)
    can_invite_users = models.BooleanField(default=False)
    can_pin_messages = models.BooleanField(default=False)
    can_manage_topics = models.BooleanField(default=False)  # برای گروه‌های موضوعی
    
    # تنظیمات جدید برای کانال‌ها
    can_post_messages = models.BooleanField(default=False)  # برای کانال‌ها
    can_edit_messages = models.BooleanField(default=False)  # برای کانال‌ها
    can_delete_messages = models.BooleanField(default=False)

    class Meta:
        db_table = 'core_chat_permissions'

    def __str__(self):
        return f"Permissions for {self.chat}"


class ChatMember(models.Model):
    """اعضای چت با سطوح دسترسی مختلف"""
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('admin', 'Admin'),
        ('member', 'Member'),
        ('restricted', 'Restricted'),
        ('banned', 'Banned'),
        ('left', 'Left'),  # کاربر گروه را ترک کرده
        ('kicked', 'Kicked'),  # کاربر اخراج شده
    ]
    
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_memberships')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')
    
    # اطلاعات عضویت
    joined_at = models.DateTimeField(auto_now_add=True)
    invited_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='invited_members')
    until_date = models.DateTimeField(null=True, blank=True)  # برای محدودیت زمانی
    
    # عنوان برای ادمین‌ها
    custom_title = models.CharField(max_length=32, blank=True, null=True)
    
    # دسترسی‌های سفارشی برای کاربران restricted
    permissions = models.ForeignKey(ChatPermissions, on_delete=models.SET_NULL, null=True, blank=True, related_name='members_with_permissions')
    
    # وضعیت
    is_member = models.BooleanField(default=True)  # آیا هنوز عضو است؟
    can_send_messages = models.BooleanField(default=True)
    can_send_media = models.BooleanField(default=True)
    can_send_polls = models.BooleanField(default=True)
    can_send_other_messages = models.BooleanField(default=True)
    can_add_web_page_previews = models.BooleanField(default=True)
    can_change_info = models.BooleanField(default=False)
    can_invite_users = models.BooleanField(default=False)
    can_pin_messages = models.BooleanField(default=False)
    can_manage_chat = models.BooleanField(default=False)  # مدیریت چت
    can_manage_video_chats = models.BooleanField(default=False)  # مدیریت تماس‌های ویدیویی
    can_manage_topics = models.BooleanField(default=False)
    
    # برای ادمین‌ها
    is_anonymous = models.BooleanField(default=False)  # آیا ادمین ناشناس است؟
    can_manage_users = models.BooleanField(default=False)  # آیا می‌تواند کاربران را مدیریت کند؟
    can_delete_messages = models.BooleanField(default=False)
    can_restrict_members = models.BooleanField(default=False)
    can_promote_members = models.BooleanField(default=False)
    can_post_messages = models.BooleanField(default=False)  # برای کانال‌ها
    can_edit_messages = models.BooleanField(default=False)  # برای کانال‌ها
    can_manage_invite_links = models.BooleanField(default=False)

    class Meta:
        unique_together = ('chat', 'user')
        db_table = 'core_chat_member'
        indexes = [
            models.Index(fields=['chat', 'role']),
            models.Index(fields=['user', 'is_member']),
        ]

    def __str__(self):
        return f"{self.user} in {self.chat} as {self.role}"

    @property
    def is_administrator(self):
        return self.role in ['owner', 'admin']
    
    @property
    def is_owner(self):
        return self.role == 'owner'
    
    @property
    def can_promote(self):
        """آیا می‌تواند کاربران دیگر را ارتقا دهد؟"""
        return self.can_promote_members or self.is_owner
    
    def get_effective_permissions(self):
        """دریافت دسترسی‌های مؤثر کاربر"""
        if self.permissions:
            return self.permissions
        
        # ایجاد دسترسی‌های پیش‌فرض بر اساس نقش
        permissions, created = ChatPermissions.objects.get_or_create(chat=self.chat)
        return permissions


class ChatInviteLink(models.Model):
    """لینک‌های دعوت اختصاصی"""
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='invite_links')
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_invite_links')
    invite_link = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=32, blank=True, null=True)  # نام دلخواه برای لینک
    
    # تنظیمات لینک
    is_primary = models.BooleanField(default=False)
    is_revoked = models.BooleanField(default=False)
    creates_join_request = models.BooleanField(default=False)  # آیا نیاز به تأیید دارد؟
    
    # محدودیت‌ها
    expiration_date = models.DateTimeField(null=True, blank=True)
    member_limit = models.PositiveIntegerField(default=0)  # 0 = unlimited
    pending_join_requests = models.PositiveIntegerField(default=0)
    
    # آمار
    used_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'core_chat_invite_link'
        indexes = [
            models.Index(fields=['invite_link']),
            models.Index(fields=['chat', 'is_revoked']),
        ]

    def __str__(self):
        return f"Invite link for {self.chat} by {self.creator}"

    @property
    def is_expired(self):
        """آیا لینک منقضی شده؟"""
        if not self.expiration_date:
            return False
        return timezone.now() > self.expiration_date
    
    @property
    def is_usable(self):
        """آیا لینک قابل استفاده است؟"""
        return not self.is_revoked and not self.is_expired and (self.member_limit == 0 or self.used_count < self.member_limit)


class Message(models.Model):
    """مدل پیام برای انواع چت‌ها"""
    MESSAGE_TYPE_CHOICES = [
        ('text', 'Text'),
        ('photo', 'Photo'),
        ('video', 'Video'),
        ('document', 'Document'),
        ('poll', 'Poll'),
        ('voice', 'Voice'),
    ]
    
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPE_CHOICES, default='text')
    
    # محتوای پیام
    content = models.TextField(max_length=4000, blank=True, null=True)
    media = models.FileField(upload_to='messages/media/', blank=True, null=True)
    poll = models.ForeignKey('Poll', on_delete=models.SET_NULL, null=True, blank=True, related_name='messages')
    
    # سیستم پاسخ و فوروارد
    reply_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')
    forward_from = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='forwards')
    forward_from_chat = models.ForeignKey(Chat, on_delete=models.SET_NULL, null=True, blank=True, related_name='forwarded_messages')
    
    # اطلاعات پیام
    is_edited = models.BooleanField(default=False)
    is_pinned = models.BooleanField(default=False)
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['chat', 'created_at']),
            models.Index(fields=['sender', 'created_at']),
        ]
        db_table = 'core_message'

    def __str__(self):
        return f"Message in {self.chat} by {self.sender}"

    def save(self, *args, **kwargs):
        if self.pk and not self._state.adding:
            self.is_edited = True
            self.edited_at = timezone.now()
        super().save(*args, **kwargs)


class MessageView(models.Model):
    """ردیابی مشاهده پیام‌ها"""
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='views')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('message', 'user')
        db_table = 'core_message_view'


class Poll(models.Model):
    """مدل نظرسنجی"""
    TYPE_CHOICES = [
        ('regular', 'Regular'),
        ('quiz', 'Quiz'),
    ]
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='polls')
    question = models.TextField(max_length=255)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='regular')
    is_anonymous = models.BooleanField(default=True)
    allows_multiple_answers = models.BooleanField(default=False)
    is_closed = models.BooleanField(default=False)
    close_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'core_poll'

    def __str__(self):
        return f"Poll: {self.question}"


class PollOption(models.Model):
    """گزینه‌های نظرسنجی"""
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=100)
    is_correct = models.BooleanField(default=False)  # برای نظرسنجی‌های quiz
    voter_count = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'core_poll_option'

    def __str__(self):
        return self.text


class PollVote(models.Model):
    """رأی‌های داده شده به نظرسنجی"""
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name='votes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='poll_votes')
    option = models.ForeignKey(PollOption, on_delete=models.CASCADE, related_name='votes')
    voted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('poll', 'user')
        db_table = 'core_poll_vote'


class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField(max_length=5000)
    image = models.ImageField(upload_to='posts/images/', blank=True, null=True)
    video = models.FileField(upload_to='posts/videos/', blank=True, null=True)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='replies')
    category = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    mentions = models.ManyToManyField(User, related_name='mentioned_in_posts', blank=True)
    tags = models.CharField(max_length=4096, blank=True)
    is_repost = models.BooleanField(default=False)
    original_post = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='reposts')
    
    # فیچر جدید: سیستم ذخیره پست‌ها
    saved_by = models.ManyToManyField(User, related_name='saved_posts', blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category', 'created_at']),
            models.Index(fields=['author', 'created_at']),
        ]
        db_table = 'core_post'

    def __str__(self):
        return f"Post by {self.author} at {self.created_at}"[:50]

    @property
    def likes_count(self):
        """تعداد لایک‌ها"""
        return self.reactions.filter(reaction='like').count()

    @property
    def dislikes_count(self):
        """تعداد دیس‌لایک‌ها"""
        return self.reactions.filter(reaction='dislike').count()

    @property
    def comments_count(self):
        """تعداد کامنت‌ها"""
        return self.comments.count()


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
    
    # فیچر جدید: اطلاعات اضافی مدیا
    caption = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'created_at']
        db_table = 'core_postmedia'

    def __str__(self):
        return f"Media for post {self.post_id} ({self.media_type})"

    def delete(self, *args, **kwargs):
        """حذف فایل فیزیکی هنگام حذف مدیا"""
        if self.file:
            if os.path.isfile(self.file.path):
                os.remove(self.file.path)
        super().delete(*args, **kwargs)


class Reaction(models.Model):
    REACTION_CHOICES = [
        ("like", "Like"),
        ("dislike", "Dislike"),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='reactions')
    reaction = models.CharField(max_length=10, choices=REACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')
        indexes = [
            models.Index(fields=['post', 'reaction']),
        ]
        db_table = 'core_reaction'

    def __str__(self):
        return f"{self.user.username} {self.reaction} on {self.post_id}"


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    
    # فیچر جدید: سیستم لایک برای کامنت‌ها
    likes = models.ManyToManyField(User, related_name='liked_comments', blank=True)

    class Meta:
        ordering = ['-created_at']
        db_table = 'core_comment'

    def __str__(self):
        return f"Comment by {self.user} on {self.post_id}"

    @property
    def likes_count(self):
        return self.likes.count()

    @property
    def replies_count(self):
        return self.replies.count()


class Notification(models.Model):
    NOTIF_TYPE_CHOICES = [
        ('like', 'Like'),
        ('comment', 'Comment'),
        ('mention', 'Mention'),
        ('repost', 'Repost'),
        ('follow', 'Follow'),
        ('reply', 'Reply'),
        ('message', 'Message'),
        ('poll', 'Poll'),
    ]
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications')
    notif_type = models.CharField(max_length=20, choices=NOTIF_TYPE_CHOICES)
    post = models.ForeignKey(Post, null=True, blank=True, on_delete=models.CASCADE)
    comment = models.ForeignKey(Comment, null=True, blank=True, on_delete=models.CASCADE)
    message = models.ForeignKey(Message, null=True, blank=True, on_delete=models.CASCADE)
    poll = models.ForeignKey(Poll, null=True, blank=True, on_delete=models.CASCADE)
    custom_message = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read', 'created_at']),
        ]
        db_table = 'core_notification'

    def __str__(self):
        return f"{self.notif_type} for {self.recipient}"

    def mark_as_read(self):
        """علامت‌گذاری نوتیفیکیشن به عنوان خوانده شده"""
        self.is_read = True
        self.save()