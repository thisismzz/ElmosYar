from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.core.mail import send_mail
from django.utils import timezone
from django.conf import settings
from django.db.models import Q, Count, F
from django.core.paginator import Paginator
from django.db import transaction
import json
from datetime import timedelta
import mimetypes

from .models import User, Post, PostMedia, Comment, Notification, Reaction, Conversation, Message


AUTH_URL = "http://89.106.206.119:3000" #it is also front's url

# ════════════════════════════════════════════════════════════
# 🔧 Helper Functions
# ════════════════════════════════════════════════════════════


def serialize_user(user, include_sensitive=False, current_user=None):
    """سریالایز کردن اطلاعات کاربر"""
    try:
        profile_picture_url = user.profile_picture.url if user.profile_picture else None
    except:
        profile_picture_url = None
    
    data = {
        'id': user.id,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'profile_picture': profile_picture_url,
        'bio': user.bio,
        'student_id': user.student_id,
        'followers_count': user.followers_count,
        'following_count': user.following_count,
        'posts_count': user.posts_count,
    }
    
    if include_sensitive:
        data.update({
            'email': user.email,
            'is_email_verified': user.is_email_verified,
            'created_at': user.created_at.isoformat(),
        })
    
    # اضافه کردن وضعیت فالو برای کاربر جاری
    if current_user and current_user.is_authenticated:
        data['is_following'] = current_user.following.filter(id=user.id).exists()
        data['is_me'] = current_user.id == user.id
    
    return data


def serialize_post(post, include_user_info=True, current_user=None):
    """سریالایز کردن اطلاعات پست"""
    # پیش‌بارگذاری مدیاها
    media_list = []
    for m in post.media.all().only('id', 'file', 'media_type', 'caption'):
        media_list.append({
            'id': m.id,
            'url': m.file.url if m.file else '',
            'type': m.media_type,
            'caption': m.caption,
        })
    
    # پیش‌بارگذاری منشن‌ها
    mentions_list = []
    for u in post.mentions.all().only('id', 'username', 'first_name', 'last_name', 'profile_picture'):
        mentions_list.append(serialize_user(u))
    
    data = {
        'id': post.id,
        'author': post.author.username,
        'content': post.content,
        'created_at': post.created_at.isoformat(),
        'updated_at': post.updated_at.isoformat(),
        'tags': [t.strip() for t in post.tags.split(',')] if post.tags else [],
        'mentions': mentions_list,
        'media': media_list,
        'likes_count': post.likes_count,
        'dislikes_count': post.dislikes_count,
        'comments_count': post.comments_count,
        'reposts_count': post.reposts.count(),
        'replies_count': post.replies.count(),
        'is_repost': post.is_repost,
        'original_post_id': post.original_post.id if post.original_post else None,
        'parent_id': post.parent.id if post.parent else None,
        'category': post.category or '',
    }
    
    if include_user_info:
        data['author_info'] = serialize_user(post.author, include_sensitive=False, current_user=current_user)
    
    # اضافه کردن وضعیت ری‌اکشن کاربر جاری با بررسی وجود
    if current_user and current_user.is_authenticated:
        user_reaction = post.reactions.filter(user=current_user).first()
        data['user_reaction'] = user_reaction.reaction if user_reaction else None
        data['is_saved'] = post.saved_by.filter(id=current_user.id).exists()
    
    return data


def serialize_comment(comment, current_user=None):
    """سریالایز کردن اطلاعات کامنت"""
    data = {
        'id': comment.id,
        'user': comment.user.username,
        'user_info': serialize_user(comment.user, include_sensitive=False, current_user=current_user),
        'content': comment.content,
        'created_at': comment.created_at.isoformat(),
        'parent_id': comment.parent.id if comment.parent else None,
        'likes_count': comment.likes_count,
        'replies_count': comment.replies_count,
    }
    
    if current_user and current_user.is_authenticated:
        data['is_liked'] = comment.likes.filter(id=current_user.id).exists()
    
    return data


def serialize_notification(notification):
    """سریالایز کردن اطلاعات نوتیفیکیشن"""
    return {
        'id': notification.id,
        'sender': notification.sender.username,
        'sender_info': serialize_user(notification.sender, include_sensitive=False),
        'type': notification.notif_type,
        'post_id': notification.post.id if notification.post else None,
        'comment_id': notification.comment.id if notification.comment else None,
        'message': notification.message,
        'is_read': notification.is_read,
        'created_at': notification.created_at.isoformat(),
    }


def serialize_conversation(conversation, current_user):
    """سریالایز کردن اطلاعات مکالمه"""
    other_user = conversation.participants.exclude(id=current_user.id).first()
    last_message = conversation.messages.last()
    
    return {
        'id': conversation.id,
        'other_user': serialize_user(other_user, include_sensitive=False) if other_user else None,
        'last_message': {
            'content': last_message.content[:100] + '...' if last_message and len(last_message.content) > 100 else last_message.content if last_message else '',
            'sender': last_message.sender.username if last_message else '',
            'created_at': last_message.created_at.isoformat() if last_message else None,
            'is_read': last_message.is_read if last_message else True,
        } if last_message else None,
        'unread_count': conversation.messages.filter(is_read=False).exclude(sender=current_user).count(),
        'updated_at': conversation.updated_at.isoformat(),
    }


def serialize_message(message):
    """سریالایز کردن اطلاعات پیام"""
    return {
        'id': message.id,
        'sender': serialize_user(message.sender, include_sensitive=False),
        'content': message.content,
        'image': message.image.url if message.image else None,
        'file': {
            'url': message.file.url if message.file else None,
            'name': message.file.name.split('/')[-1] if message.file else None,
        } if message.file else None,
        'is_read': message.is_read,
        'created_at': message.created_at.isoformat(),
    }


# ════════════════════════════════════════════════════════════
# 🏠 Basic Endpoint
# ════════════════════════════════════════════════════════════

@require_http_methods(["GET"])
def index(request):
    """API root endpoint"""
    return JsonResponse({
        'success': True,
        'message': 'API is running',
        'endpoints': {
            'auth': {
                'signup': '/api/signup/',
                'login': '/api/login/',
                'logout': '/api/logout/',
                'verify_email': '/api/verify-email/{token}/',
                'password_reset_request': '/api/password-reset/request/',
                'password_reset': '/api/password-reset/{token}/',
            },
            'profile': {
                'get_profile': '/api/profile/',
                'update_profile': '/api/profile/update/',
                'update_profile_picture': '/api/profile/update-picture/',
                'get_user_profile': '/api/users/{username}/profile/',
            },
            'posts': {
                'list_create': '/api/posts/',
                'detail': '/api/posts/{post_id}/',
                'like': '/api/posts/{post_id}/like/',
                'dislike': '/api/posts/{post_id}/dislike/',
                'comment': '/api/posts/{post_id}/comment/',
                'repost': '/api/posts/{post_id}/repost/',
                'thread': '/api/posts/{post_id}/thread/',
                'by_category': '/api/posts/category/{category_id}/',
                'user_posts': '/api/users/{username}/posts/',
                'saved_posts': '/api/posts/saved/',
                'save_post': '/api/posts/{post_id}/save/',
                'unsave_post': '/api/posts/{post_id}/unsave/',
            },
            'social': {
                'follow': '/api/users/{username}/follow/',
                'unfollow': '/api/users/{username}/unfollow/',
                'followers': '/api/users/{username}/followers/',
                'following': '/api/users/{username}/following/',
            },
            'notifications': {
                'list': '/api/notifications/',
                'mark_read': '/api/notifications/mark-read/',
            },
            'messaging': {
                'conversations': '/api/conversations/',
                'conversation_detail': '/api/conversations/{conversation_id}/',
                'send_message': '/api/conversations/{conversation_id}/send/',
                'start_conversation': '/api/conversations/start/{username}/',
            }
        }
    })


# ════════════════════════════════════════════════════════════
# 🔐 Authentication Endpoints
# ════════════════════════════════════════════════════════════

@csrf_exempt
@require_http_methods(["POST"])
def signup(request):
    """Register a new user"""
    try:
        with transaction.atomic():
            data = json.loads(request.body)
            username = data.get('username', '').strip()
            email = data.get('email', '').strip()
            password = data.get('password', '')
            password_confirm = data.get('password_confirm', '')

            # Validation
            if not all([username, email, password, password_confirm]):
                return JsonResponse({
                    'success': False,
                    'message': 'All fields are required'
                }, status=400)

            if len(username) < 3 or len(username) > 30:
                return JsonResponse({
                    'success': False,
                    'message': 'Username must be between 3 and 30 characters'
                }, status=400)

            if password != password_confirm:
                return JsonResponse({
                    'success': False,
                    'message': 'Passwords do not match'
                }, status=400)

            if len(password) < 8:
                return JsonResponse({
                    'success': False,
                    'message': 'Password must be at least 8 characters'
                }, status=400)

            if User.objects.filter(username=username).exists():
                return JsonResponse({
                    'success': False,
                    'message': 'Username already exists'
                }, status=400)

            if User.objects.filter(email=email).exists():
                return JsonResponse({
                    'success': False,
                    'message': 'Email already exists'
                }, status=400)

            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                is_active=False
            )

            # Send verification email
            verification_token = user.generate_email_verification_token()
            user.email_verification_sent_at = timezone.now()
            user.save()

            verification_link = f"{AUTH_URL}/verify-email/{verification_token}/"
            
            try:
                send_mail(
                    'Email Verification',
                    f'Click this link to verify your email: {verification_link}',
                    settings.DEFAULT_FROM_EMAIL or 'noreply@example.com',
                    [user.email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Email sending failed: {e}")

            return JsonResponse({
                'success': True,
                'message': 'Signup successful. Please check your email to verify your account.',
                'user': serialize_user(user, include_sensitive=True)
            }, status=201)

    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def verify_email(request, token):
    """Verify user email"""
    try:
        with transaction.atomic():
            user = get_object_or_404(User, email_verification_token=token)
            
            if user.is_email_verified:
                return JsonResponse({
                    'success': False,
                    'message': 'Email is already verified'
                }, status=400)
            
            if not user.is_email_verification_token_valid():
                return JsonResponse({
                    'success': False,
                    'message': 'Verification token has expired'
                }, status=400)
            
            user.verify_email()
            user.is_active = True
            user.save()
            
            # لاگین کردن کاربر بعد از تأیید ایمیل
            try:
                login(request, user)
            except Exception:
                pass  # اگر لاگین شکست خورد، ادامه بده
            
            return JsonResponse({
                'success': True,
                'message': 'Email verified successfully. You are now logged in.',
                'user': serialize_user(user, include_sensitive=True)
            })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def login_user(request):
    """User login"""
    try:
        data = json.loads(request.body)
        username_or_email = data.get('username_or_email', '').strip()
        password = data.get('password', '')
        remember = data.get('remember', False)

        if not all([username_or_email, password]):
            return JsonResponse({
                'success': False,
                'message': 'Username/Email and password are required'
            }, status=400)

        # Find user
        user = User.objects.filter(email=username_or_email).first() or \
               User.objects.filter(username=username_or_email).first()

        if user and user.check_password(password):
            if not user.is_active:
                return JsonResponse({
                    'success': False,
                    'message': 'Please verify your email first'
                }, status=400)

            login(request, user)
            
            # Set session expiry
            if remember:
                request.session.set_expiry(60 * 60 * 24 * 30)  # 30 days
            else:
                request.session.set_expiry(0)  # Browser close
            
            return JsonResponse({
                'success': True,
                'message': 'Login successful',
                'user': serialize_user(user, include_sensitive=True)
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Invalid credentials'
            }, status=401)

    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def logout_user(request):
    """User logout"""
    logout(request)
    return JsonResponse({
        'success': True,
        'message': 'Logout successful'
    })


@csrf_exempt
@require_http_methods(["POST"])
def request_password_reset(request):
    """Request password reset"""
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip()

        if not email:
            return JsonResponse({
                'success': False,
                'message': 'Email is required'
            }, status=400)

        user = User.objects.filter(email=email).first()

        if user:
            reset_token = user.generate_password_reset_token()
            user.password_reset_sent_at = timezone.now()
            user.save()

            reset_link = f"{AUTH_URL}/password-reset/{reset_token}/"
            
            try:
                send_mail(
                    'Password Reset Request',
                    f'Click this link to reset your password: {reset_link}',
                    settings.DEFAULT_FROM_EMAIL or 'noreply@example.com',
                    [user.email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Email sending failed: {e}")

        # همیشه همین پیام را برگردان، حتی اگر ایمیل وجود نداشته باشد
        return JsonResponse({
            'success': True,
            'message': 'If this email exists in our system, a password reset link has been sent'
        })

    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def reset_password(request, token):
    """Reset password with token"""
    try:
        with transaction.atomic():
            user = get_object_or_404(User, password_reset_token=token)

            token_age = timezone.now() - user.password_reset_sent_at
            if token_age > timedelta(hours=1):
                return JsonResponse({
                    'success': False,
                    'message': 'Password reset token has expired'
                }, status=400)

            data = json.loads(request.body)
            password = data.get('password', '')
            password_confirm = data.get('password_confirm', '')

            if not all([password, password_confirm]):
                return JsonResponse({
                    'success': False,
                    'message': 'Password and confirmation are required'
                }, status=400)

            if password != password_confirm:
                return JsonResponse({
                    'success': False,
                    'message': 'Passwords do not match'
                }, status=400)

            if len(password) < 8:
                return JsonResponse({
                    'success': False,
                    'message': 'Password must be at least 8 characters'
                }, status=400)

            user.set_password(password)
            user.password_reset_token = None
            user.password_reset_sent_at = None
            user.save()

            return JsonResponse({
                'success': True,
                'message': 'Password reset successfully. You can now login.'
            })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


# ════════════════════════════════════════════════════════════
# 👤 Profile Endpoints
# ════════════════════════════════════════════════════════════

@require_http_methods(["GET"])
def get_profile(request):
    """Get current user profile"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'User not authenticated'
        }, status=401)

    return JsonResponse({
        'success': True,
        'user': serialize_user(request.user, include_sensitive=True, current_user=request.user)
    })


@require_http_methods(["GET"])
def get_user_profile(request, username):
    """Get any user's public profile"""
    user = get_object_or_404(User, username=username)
    
    # اگر کاربر جاری باشد، اطلاعات حساس شامل شود
    include_sensitive = request.user.is_authenticated and request.user.id == user.id
    
    return JsonResponse({
        'success': True,
        'user': serialize_user(user, include_sensitive=include_sensitive, current_user=request.user)
    })


@csrf_exempt
@require_http_methods(["PUT", "POST", "PATCH"])
def update_profile(request):
    """Update user profile"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'User not authenticated'
        }, status=401)

    try:
        with transaction.atomic():
            data = json.loads(request.body)
            user = request.user

            # Update allowed fields with validation
            allowed_fields = {
                'first_name': {'max_length': 150},
                'last_name': {'max_length': 150},
                'student_id': {'max_length': 20},
                'bio': {'max_length': 500}
            }
            
            for field, constraints in allowed_fields.items():
                if field in data:
                    value = data[field]
                    if len(str(value)) > constraints['max_length']:
                        return JsonResponse({
                            'success': False,
                            'message': f'{field} is too long (max {constraints["max_length"]} characters)'
                        }, status=400)
                    setattr(user, field, value)

            user.save()

            return JsonResponse({
                'success': True,
                'message': 'Profile updated successfully',
                'user': serialize_user(user, include_sensitive=True, current_user=request.user)
            })

    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["DELETE", "POST"])
def delete_profile_picture(request):
    """Delete profile picture"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'User not authenticated'
        }, status=401)

    try:
        with transaction.atomic():
            user = request.user

            if not user.profile_picture:
                return JsonResponse({
                    'success': False,
                    'message': 'No profile picture to delete'
                }, status=400)

            # Delete old picture
            user.profile_picture.delete(save=False)
            user.profile_picture = None
            user.save()

            return JsonResponse({
                'success': True,
                'message': 'Profile picture deleted successfully'
            })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def update_profile_picture(request):
    """Update profile picture"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'User not authenticated'
        }, status=401)

    try:
        # ابتدا فایل جدید را اعتبارسنجی می‌کنیم
        if 'profile_picture' not in request.FILES:
            return JsonResponse({
                'success': False,
                'message': 'No image file provided'
            }, status=400)

        profile_picture = request.FILES['profile_picture']
        user = request.user

        # بررسی نوع فایل
        if not profile_picture.content_type.startswith('image/'):
            return JsonResponse({
                'success': False,
                'message': 'Only image files are allowed'
            }, status=400)

        # بررسی سایز فایل (حداکثر 5MB)
        if profile_picture.size > 5 * 1024 * 1024:
            return JsonResponse({
                'success': False,
                'message': 'Image file is too large (max 5MB)'
            }, status=400)

        with transaction.atomic():
            # ذخیره مسیر فایل قدیمی برای پشتیبان‌گیری
            old_picture_path = user.profile_picture.path if user.profile_picture else None
            
            try:
                user.profile_picture = profile_picture
                user.save()
                
                # اگر آپلود موفق بود، فایل قدیمی را حذف کن
                if old_picture_path:
                    import os
                    if os.path.isfile(old_picture_path):
                        os.remove(old_picture_path)
                        
            except Exception:
                # اگر خطا رخ داد، تغییرات را rollback کن
                if old_picture_path and user.profile_picture:
                    user.profile_picture = old_picture_path
                    user.save()
                raise

            return JsonResponse({
                'success': True,
                'message': 'Profile picture updated successfully',
                'profile_picture': user.profile_picture.url if user.profile_picture else None
            })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


# ════════════════════════════════════════════════════════════
# 🤝 Social Endpoints
# ════════════════════════════════════════════════════════════

@csrf_exempt
@require_http_methods(["POST"])
def follow_user(request, username):
    """Follow a user"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            user_to_follow = get_object_or_404(User, username=username)
            
            if user_to_follow == request.user:
                return JsonResponse({
                    'success': False,
                    'message': 'You cannot follow yourself'
                }, status=400)
            
            if request.user.following.filter(id=user_to_follow.id).exists():
                return JsonResponse({
                    'success': False,
                    'message': f'You are already following {username}'
                }, status=400)
            
            # استفاده از F() برای جلوگیری از race condition
            User.objects.filter(id=request.user.id).update(
                following_count=F('following_count') + 1
            )
            User.objects.filter(id=user_to_follow.id).update(
                followers_count=F('followers_count') + 1
            )
            
            request.user.following.add(user_to_follow)
            
            # ایجاد نوتیفیکیشن
            Notification.objects.create(
                recipient=user_to_follow,
                sender=request.user,
                notif_type='follow',
                message=f'{request.user.username} started following you'
            )
            
            # بازخوانی کاربر برای گرفتن مقادیر به‌روز شده
            user_to_follow.refresh_from_db()
            
            return JsonResponse({
                'success': True,
                'message': f'You are now following {username}',
                'followers_count': user_to_follow.followers_count
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def unfollow_user(request, username):
    """Unfollow a user"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            user_to_unfollow = get_object_or_404(User, username=username)
            
            if not request.user.following.filter(id=user_to_unfollow.id).exists():
                return JsonResponse({
                    'success': False,
                    'message': f'You are not following {username}'
                }, status=400)
            
            # استفاده از F() برای جلوگیری از race condition
            User.objects.filter(id=request.user.id).update(
                following_count=F('following_count') - 1
            )
            User.objects.filter(id=user_to_unfollow.id).update(
                followers_count=F('followers_count') - 1
            )
            
            request.user.following.remove(user_to_unfollow)
            
            # بازخوانی کاربر برای گرفتن مقادیر به‌روز شده
            user_to_unfollow.refresh_from_db()
            
            return JsonResponse({
                'success': True,
                'message': f'You have unfollowed {username}',
                'followers_count': user_to_unfollow.followers_count
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@require_http_methods(["GET"])
def user_followers(request, username):
    """Get user's followers"""
    user = get_object_or_404(User, username=username)
    
    page = int(request.GET.get('page', 1))
    per_page = min(int(request.GET.get('per_page', 50)), 100)
    
    followers = user.followers.all()
    paginator = Paginator(followers, per_page)
    
    try:
        followers_page = paginator.page(page)
    except:
        followers_page = paginator.page(1)
    
    return JsonResponse({
        'success': True,
        'followers': [serialize_user(f, current_user=request.user) for f in followers_page],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total_pages': paginator.num_pages,
            'total_count': paginator.count,
            'has_next': followers_page.has_next(),
            'has_previous': followers_page.has_previous(),
        }
    })


@require_http_methods(["GET"])
def user_following(request, username):
    """Get users that this user is following"""
    user = get_object_or_404(User, username=username)
    
    page = int(request.GET.get('page', 1))
    per_page = min(int(request.GET.get('per_page', 50)), 100)
    
    following = user.following.all()
    paginator = Paginator(following, per_page)
    
    try:
        following_page = paginator.page(page)
    except:
        following_page = paginator.page(1)
    
    return JsonResponse({
        'success': True,
        'following': [serialize_user(f, current_user=request.user) for f in following_page],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total_pages': paginator.num_pages,
            'total_count': paginator.count,
            'has_next': following_page.has_next(),
            'has_previous': following_page.has_previous(),
        }
    })


# ════════════════════════════════════════════════════════════
# 📝 Post Endpoints
# ════════════════════════════════════════════════════════════

@csrf_exempt
@require_http_methods(["GET", "POST"])
def posts_list_create(request):
    """List all posts or create new post"""
    
    if request.method == 'GET':
        # پارامترهای جستجو
        category = request.GET.get('category')
        username = request.GET.get('username')
        page = int(request.GET.get('page', 1))
        per_page = min(int(request.GET.get('per_page', 20)), 100)  # حداکثر 100 پست در صفحه
        
        # ساخت کوئری
        query = Post.objects.filter(parent=None)
        
        if category:
            query = query.filter(category=category)
        
        if username:
            user = get_object_or_404(User, username=username)
            query = query.filter(author=user)
        
        posts = query.select_related('author').prefetch_related(
            'media', 'mentions', 'reactions'
        ).order_by('-created_at')
        
        # Pagination
        paginator = Paginator(posts, per_page)
        try:
            posts_page = paginator.page(page)
        except:
            posts_page = paginator.page(1)
        
        return JsonResponse({
            'success': True,
            'posts': [serialize_post(p, include_user_info=True, current_user=request.user) for p in posts_page],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total_pages': paginator.num_pages,
                'total_count': paginator.count,
                'has_next': posts_page.has_next(),
                'has_previous': posts_page.has_previous(),
            }
        })
    
    # POST - ایجاد پست جدید
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)

    try:
        with transaction.atomic():
            content = request.POST.get('content', '').strip()
            tags = request.POST.get('tags', '').strip()
            mentions_raw = request.POST.get('mentions', '').strip()
            parent_id = request.POST.get('parent')
            category = request.POST.get('category', '').strip()

            # اعتبارسنجی
            if not content and not request.FILES:
                return JsonResponse({
                    'success': False,
                    'message': 'Post content or media required'
                }, status=400)

            if len(content) > 5000:
                return JsonResponse({
                    'success': False,
                    'message': 'Post content is too long (max 5000 characters)'
                }, status=400)

            if len(tags) > 4096:
                return JsonResponse({
                    'success': False,
                    'message': 'Tags are too long'
                }, status=400)

            # دسته‌بندی برای پست‌های اصلی الزامی است
            if not parent_id and not category:
                return JsonResponse({
                    'success': False,
                    'message': 'Room/Category is required'
                }, status=400)

            parent = None
            if parent_id:
                parent = Post.objects.filter(id=parent_id).first()

            post = Post.objects.create(
                author=request.user,
                content=content,
                tags=tags,
                parent=parent,
                category=category
            )

            # مدیریت منشن‌ها
            if mentions_raw:
                usernames = [u.strip() for u in mentions_raw.split(',') if u.strip()]
                mentioned_users = User.objects.filter(username__in=usernames)
                for mu in mentioned_users:
                    post.mentions.add(mu)
                    if mu != request.user:
                        Notification.objects.create(
                            recipient=mu,
                            sender=request.user,
                            notif_type='mention',
                            post=post,
                            message=f'{request.user.username} mentioned you in a post'
                        )

            # مدیریت فایل‌های مدیا
            for f in request.FILES.getlist('media'):
                # اعتبارسنجی نوع فایل
                ctype = f.content_type or mimetypes.guess_type(f.name)[0] or ''
                if ctype.startswith('image/'):
                    mtype = 'image'
                elif ctype.startswith('video/'):
                    mtype = 'video'
                elif ctype.startswith('audio/'):
                    mtype = 'audio'
                else:
                    mtype = 'file'
                
                # اعتبارسنجی سایز فایل (حداکثر 10MB)
                if f.size > 10 * 1024 * 1024:
                    continue  # فایل‌های بزرگ را نادیده بگیر
                    
                PostMedia.objects.create(post=post, file=f, media_type=mtype)

            return JsonResponse({
                'success': True,
                'post': serialize_post(post, include_user_info=True, current_user=request.user)
            }, status=201)

    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@require_http_methods(["GET"])
def post_detail(request, post_id):
    """Get single post details with comments and replies"""
    post = get_object_or_404(Post, id=post_id)
    data = serialize_post(post, include_user_info=True, current_user=request.user)
    
    # Get comments
    comments = Comment.objects.filter(post=post).select_related('user').order_by('created_at')
    data['comments'] = [serialize_comment(c, current_user=request.user) for c in comments]
    
    # Get replies
    replies = Post.objects.filter(parent=post).select_related('author').prefetch_related(
        'media', 'mentions'
    ).order_by('created_at')
    data['replies'] = [serialize_post(r, include_user_info=True, current_user=request.user) for r in replies]
    
    return JsonResponse({
        'success': True,
        'post': data
    })


@csrf_exempt
@require_http_methods(["POST"])
def post_like(request, post_id):
    """Like/unlike a post"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            post = get_object_or_404(Post, id=post_id)
            
            if post.author == request.user:
                return JsonResponse({
                    'success': False,
                    'message': 'You cannot like your own post'
                }, status=400)
            
            r = Reaction.objects.filter(user=request.user, post=post).first()
            
            if r and r.reaction == 'like':
                # Unlike
                r.delete()
                likes_count = post.reactions.filter(reaction='like').count()
                dislikes_count = post.reactions.filter(reaction='dislike').count()
                return JsonResponse({
                    'success': True,
                    'message': 'Unliked',
                    'likes_count': likes_count,
                    'dislikes_count': dislikes_count,
                    'user_reaction': None
                })
            else:
                # Like - حذف reaction قبلی اگر وجود دارد
                if r:
                    r.delete()
                
                Reaction.objects.create(user=request.user, post=post, reaction='like')
                
                # ایجاد نوتیفیکیشن
                if post.author != request.user:
                    Notification.objects.create(
                        recipient=post.author,
                        sender=request.user,
                        notif_type='like',
                        post=post,
                        message=f'{request.user.username} liked your post'
                    )
                
                likes_count = post.reactions.filter(reaction='like').count()
                dislikes_count = post.reactions.filter(reaction='dislike').count()
                return JsonResponse({
                    'success': True,
                    'message': 'Liked',
                    'likes_count': likes_count,
                    'dislikes_count': dislikes_count,
                    'user_reaction': 'like'
                })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def post_dislike(request, post_id):
    """Dislike/remove dislike from a post"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            post = get_object_or_404(Post, id=post_id)
            
            if post.author == request.user:
                return JsonResponse({
                    'success': False,
                    'message': 'You cannot dislike your own post'
                }, status=400)
            
            r = Reaction.objects.filter(user=request.user, post=post).first()
            
            if r and r.reaction == 'dislike':
                # Remove dislike
                r.delete()
                likes_count = post.reactions.filter(reaction='like').count()
                dislikes_count = post.reactions.filter(reaction='dislike').count()
                return JsonResponse({
                    'success': True,
                    'message': 'Removed dislike',
                    'likes_count': likes_count,
                    'dislikes_count': dislikes_count,
                    'user_reaction': None
                })
            else:
                # Dislike - حذف reaction قبلی اگر وجود دارد
                if r:
                    r.delete()
                
                Reaction.objects.create(user=request.user, post=post, reaction='dislike')
                
                likes_count = post.reactions.filter(reaction='like').count()
                dislikes_count = post.reactions.filter(reaction='dislike').count()
                return JsonResponse({
                    'success': True,
                    'message': 'Disliked',
                    'likes_count': likes_count,
                    'dislikes_count': dislikes_count,
                    'user_reaction': 'dislike'
                })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def post_comment(request, post_id):
    """Add comment to a post"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            post = get_object_or_404(Post, id=post_id)
            
            try:
                data = json.loads(request.body)
            except Exception:
                return JsonResponse({
                    'success': False,
                    'message': 'Invalid JSON'
                }, status=400)
            
            content = data.get('content', '').strip()
            parent_id = data.get('parent')
            
            if not content:
                return JsonResponse({
                    'success': False,
                    'message': 'Comment content required'
                }, status=400)
            
            parent = None
            if parent_id:
                parent = Comment.objects.filter(id=parent_id, post=post).first()
            
            comment = Comment.objects.create(
                user=request.user,
                post=post,
                content=content,
                parent=parent
            )
            
            # ایجاد نوتیفیکیشن
            if post.author != request.user:
                Notification.objects.create(
                    recipient=post.author,
                    sender=request.user,
                    notif_type='comment',
                    post=post,
                    comment=comment,
                    message=f'{request.user.username} commented on your post'
                )
            
            # اگر کامنت پاسخ به کامنت دیگری است
            if parent and parent.user != request.user:
                Notification.objects.create(
                    recipient=parent.user,
                    sender=request.user,
                    notif_type='reply',
                    post=post,
                    comment=comment,
                    message=f'{request.user.username} replied to your comment'
                )
            
            return JsonResponse({
                'success': True,
                'comment': serialize_comment(comment, current_user=request.user),
                'comments_count': post.comments.count()
            })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["DELETE", "POST"])
def delete_post(request, post_id):
    """Delete a post"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            post = get_object_or_404(Post, id=post_id)
            
            if post.author != request.user:
                return JsonResponse({
                    'success': False,
                    'message': 'You can only delete your own posts'
                }, status=403)
            
            post.delete()
            return JsonResponse({
                'success': True,
                'message': 'Post deleted successfully'
            })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["PUT", "PATCH", "POST"])
def update_post(request, post_id):
    """Update a post"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            post = get_object_or_404(Post, id=post_id)
            
            if post.author != request.user:
                return JsonResponse({
                    'success': False,
                    'message': 'You can only edit your own posts'
                }, status=403)
            
            data = json.loads(request.body) if request.body else {}
            
            # فقط فیلدهای قابل ویرایش
            updatable_fields = ['content', 'tags', 'category']
            updated = False
            
            for field in updatable_fields:
                if field in data:
                    if field == 'content' and len(data[field]) > 5000:
                        return JsonResponse({
                            'success': False,
                            'message': 'Content is too long (max 5000 characters)'
                        }, status=400)
                    
                    setattr(post, field, data[field])
                    updated = True
            
            if updated:
                post.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Post updated successfully',
                'post': serialize_post(post, include_user_info=True, current_user=request.user)
            })
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def post_repost(request, post_id):
    """Repost a post"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            post = get_object_or_404(Post, id=post_id)
            
            # بررسی اینکه کاربر پست خودش را repost نکند
            if post.author == request.user:
                return JsonResponse({
                    'success': False,
                    'message': 'You cannot repost your own post'
                }, status=400)
            
            new_post = Post.objects.create(
                author=request.user,
                content=post.content,
                is_repost=True,
                original_post=post,
                tags=post.tags,
                category=post.category
            )
            
            for mu in post.mentions.all():
                new_post.mentions.add(mu)
            
            for m in post.media.all():
                PostMedia.objects.create(post=new_post, file=m.file, media_type=m.media_type)
            
            # ایجاد نوتیفیکیشن
            Notification.objects.create(
                recipient=post.author,
                sender=request.user,
                notif_type='repost',
                post=post,
                message=f'{request.user.username} reposted your post'
            )
            
            return JsonResponse({
                'success': True,
                'post': serialize_post(new_post, include_user_info=True, current_user=request.user)
            })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@require_http_methods(["GET"])
def posts_by_category(request, category_id):
    """Get posts by category/room"""
    posts = Post.objects.filter(
        category=category_id,
        parent=None
    ).select_related('author').prefetch_related(
        'media', 'mentions'
    ).order_by('-created_at')[:100]
    
    return JsonResponse({
        'success': True,
        'posts': [serialize_post(p, include_user_info=True, current_user=request.user) for p in posts],
        'category': category_id,
        'count': len(posts)
    })


@require_http_methods(["GET"])
def user_posts(request, username):
    """Get posts by specific user"""
    user = get_object_or_404(User, username=username)
    posts = Post.objects.filter(
        author=user,
        parent=None
    ).select_related('author').prefetch_related(
        'media', 'mentions'
    ).order_by('-created_at')[:100]
    
    return JsonResponse({
        'success': True,
        'posts': [serialize_post(p, include_user_info=True, current_user=request.user) for p in posts],
        'username': username,
        'user': serialize_user(user, include_sensitive=False, current_user=request.user),
        'count': len(posts)
    })


@require_http_methods(["GET"])
def post_thread(request, post_id):
    """Get post thread (post with all its replies)"""
    post = get_object_or_404(Post, id=post_id)
    data = serialize_post(post, include_user_info=True, current_user=request.user)
    
    replies = [
        serialize_post(r, include_user_info=True, current_user=request.user)
        for r in post.replies.select_related('author').prefetch_related(
            'media', 'mentions'
        ).order_by('created_at')
    ]
    data['replies'] = replies
    
    return JsonResponse({
        'success': True,
        'thread': data
    })


@csrf_exempt
@require_http_methods(["POST"])
def save_post(request, post_id):
    """Save a post"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            post = get_object_or_404(Post, id=post_id)
            
            if post.saved_by.filter(id=request.user.id).exists():
                return JsonResponse({
                    'success': False,
                    'message': 'Post already saved'
                }, status=400)
            
            post.saved_by.add(request.user)
            
            return JsonResponse({
                'success': True,
                'message': 'Post saved successfully'
            })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def unsave_post(request, post_id):
    """Unsave a post"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            post = get_object_or_404(Post, id=post_id)
            
            if not post.saved_by.filter(id=request.user.id).exists():
                return JsonResponse({
                    'success': False,
                    'message': 'Post not saved'
                }, status=400)
            
            post.saved_by.remove(request.user)
            
            return JsonResponse({
                'success': True,
                'message': 'Post unsaved successfully'
            })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@require_http_methods(["GET"])
def saved_posts(request):
    """Get user's saved posts"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    saved_posts = request.user.saved_posts.filter(parent=None)
    
    return JsonResponse({
        'success': True,
        'posts': [serialize_post(p, include_user_info=True, current_user=request.user) for p in saved_posts],
        'count': len(saved_posts)
    })


@csrf_exempt
@require_http_methods(["POST"])
def like_comment(request, comment_id):
    """Like/unlike a comment"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            comment = get_object_or_404(Comment, id=comment_id)
            
            if comment.user == request.user:
                return JsonResponse({
                    'success': False,
                    'message': 'You cannot like your own comment'
                }, status=400)
            
            if comment.likes.filter(id=request.user.id).exists():
                comment.likes.remove(request.user)
                action = 'unliked'
            else:
                comment.likes.add(request.user)
                action = 'liked'
            
            return JsonResponse({
                'success': True,
                'message': f'Comment {action}',
                'likes_count': comment.likes_count,
                'is_liked': comment.likes.filter(id=request.user.id).exists()
            })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["DELETE", "POST"])
def delete_comment(request, comment_id):
    """Delete a comment"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            comment = get_object_or_404(Comment, id=comment_id)
            
            if comment.user != request.user:
                return JsonResponse({
                    'success': False,
                    'message': 'You can only delete your own comments'
                }, status=403)
            
            comment.delete()
            return JsonResponse({
                'success': True,
                'message': 'Comment deleted successfully'
            })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["PUT", "PATCH", "POST"])
def update_comment(request, comment_id):
    """Update a comment"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            comment = get_object_or_404(Comment, id=comment_id)
            
            if comment.user != request.user:
                return JsonResponse({
                    'success': False,
                    'message': 'You can only edit your own comments'
                }, status=403)
            
            data = json.loads(request.body)
            content = data.get('content', '').strip()
            
            if not content:
                return JsonResponse({
                    'success': False,
                    'message': 'Comment content is required'
                }, status=400)
            
            if len(content) > 1000:
                return JsonResponse({
                    'success': False,
                    'message': 'Comment is too long (max 1000 characters)'
                }, status=400)
            
            comment.content = content
            comment.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Comment updated successfully',
                'comment': serialize_comment(comment, current_user=request.user)
            })
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)

# ════════════════════════════════════════════════════════════
# 🔔 Notification Endpoints
# ════════════════════════════════════════════════════════════

@require_http_methods(["GET"])
def notifications_list(request):
    """Get user notifications"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    notifs = Notification.objects.filter(
        recipient=request.user
    ).select_related('sender', 'post', 'comment').order_by('-created_at')[:100]
    
    return JsonResponse({
        'success': True,
        'notifications': [serialize_notification(n) for n in notifs],
        'unread_count': notifs.filter(is_read=False).count()
    })


@csrf_exempt
@require_http_methods(["POST"])
def notifications_mark_read(request):
    """Mark notifications as read"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        data = json.loads(request.body)
    except Exception:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON'
        }, status=400)
    
    ids = data.get('ids', [])
    
    if not ids:
        # Mark all as read
        Notification.objects.filter(recipient=request.user).update(is_read=True)
    else:
        # Mark specific notifications as read
        Notification.objects.filter(
            recipient=request.user,
            id__in=ids
        ).update(is_read=True)
    
    return JsonResponse({
        'success': True,
        'message': 'Notifications marked as read'
    })


# ════════════════════════════════════════════════════════════
# 💬 Messaging Endpoints
# ════════════════════════════════════════════════════════════

@require_http_methods(["GET"])
def conversations_list(request):
    """Get user's conversations"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    conversations = Conversation.objects.filter(participants=request.user)
    
    return JsonResponse({
        'success': True,
        'conversations': [serialize_conversation(c, request.user) for c in conversations],
        'count': len(conversations)
    })


@csrf_exempt
@require_http_methods(["POST"])
def start_conversation(request, username):
    """Start a new conversation"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            other_user = get_object_or_404(User, username=username)
            
            if other_user == request.user:
                return JsonResponse({
                    'success': False,
                    'message': 'Cannot start conversation with yourself'
                }, status=400)
            
            # بررسی وجود مکالمه قبلی
            conversation = Conversation.objects.filter(participants=request.user).filter(participants=other_user).first()
            
            if not conversation:
                conversation = Conversation.objects.create()
                conversation.participants.add(request.user, other_user)
            
            return JsonResponse({
                'success': True,
                'conversation_id': conversation.id,
                'message': 'Conversation started successfully'
            })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@require_http_methods(["GET"])
def conversation_detail(request, conversation_id):
    """Get conversation messages"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    conversation = get_object_or_404(Conversation, id=conversation_id, participants=request.user)
    
    # علامت‌گذاری پیام‌ها به عنوان خوانده شده
    conversation.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
    
    messages = conversation.messages.all()
    
    return JsonResponse({
        'success': True,
        'conversation': serialize_conversation(conversation, request.user),
        'messages': [serialize_message(m) for m in messages],
        'count': len(messages)
    })


@csrf_exempt
@require_http_methods(["POST"])
def send_message(request, conversation_id):
    """Send a message in conversation"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            conversation = get_object_or_404(Conversation, id=conversation_id, participants=request.user)
            
            data = request.POST
            content = data.get('content', '').strip()
            image = request.FILES.get('image')
            file = request.FILES.get('file')
            
            if not content and not image and not file:
                return JsonResponse({
                    'success': False,
                    'message': 'Message content or file is required'
                }, status=400)
            
            message = Message.objects.create(
                conversation=conversation,
                sender=request.user,
                content=content,
                image=image,
                file=file
            )
            
            # آپدیت زمان مکالمه
            conversation.updated_at = timezone.now()
            conversation.save()
            
            return JsonResponse({
                'success': True,
                'message': serialize_message(message)
            }, status=201)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)
    
@csrf_exempt
@require_http_methods(["DELETE", "POST"])
def delete_message(request, message_id):
    """Delete a message"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            message = get_object_or_404(Message, id=message_id)
            
            if message.sender != request.user:
                return JsonResponse({
                    'success': False,
                    'message': 'You can only delete your own messages'
                }, status=403)
            
            message.delete()
            return JsonResponse({
                'success': True,
                'message': 'Message deleted successfully'
            })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["PUT", "PATCH", "POST"])
def update_message(request, message_id):
    """Update a message"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            message = get_object_or_404(Message, id=message_id)
            
            if message.sender != request.user:
                return JsonResponse({
                    'success': False,
                    'message': 'You can only edit your own messages'
                }, status=403)
            
            data = json.loads(request.body)
            content = data.get('content', '').strip()
            
            if not content:
                return JsonResponse({
                    'success': False,
                    'message': 'Message content is required'
                }, status=400)
            
            if len(content) > 2000:
                return JsonResponse({
                    'success': False,
                    'message': 'Message is too long (max 2000 characters)'
                }, status=400)
            
            message.content = content
            message.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Message updated successfully',
                'message_data': serialize_message(message)
            })
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)