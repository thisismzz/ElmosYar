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
import uuid

from .models import User, Post, PostMedia, Comment, Notification, Reaction, Chat, ChatMember, Message, MessageView, Poll, PollOption, PollVote


# ════════════════════════════════════════════════════════════
# 🔧 New Helper Functions for Chat System
# ════════════════════════════════════════════════════════════

def serialize_chat(chat, current_user=None):
    """سریالایز کردن اطلاعات چت"""
    data = {
        'id': chat.id,
        'type': chat.type,
        'visibility': chat.visibility,
        'title': chat.title,
        'username': chat.username,
        'description': chat.description,
        'photo': chat.photo.url if chat.photo else None,
        'participants_count': chat.participants_count,
        'is_verified': chat.is_verified,
        'is_restricted': chat.is_restricted,
        'anyone_can_send_messages': chat.anyone_can_send_messages,
        'slow_mode_delay': chat.slow_mode_delay,
        'created_at': chat.created_at.isoformat(),
        'updated_at': chat.updated_at.isoformat(),
    }
    
    if current_user and current_user.is_authenticated:
        try:
            member = chat.members.get(user=current_user)
            data['my_role'] = member.role
            data['my_permissions'] = {
                'can_send_messages': member.can_send_messages,
                'can_send_media': member.can_send_media,
                'can_send_polls': member.can_send_polls,
                'can_invite_users': member.can_invite_users,
                'can_pin_messages': member.can_pin_messages,
                'can_change_info': member.can_change_info,
            }
        except ChatMember.DoesNotExist:
            data['my_role'] = None
            data['my_permissions'] = {}
    
    return data


def serialize_chat_member(member):
    """سریالایز کردن اطلاعات عضو چت"""
    return {
        'user': serialize_user(member.user),
        'role': member.role,
        'custom_title': member.custom_title,
        'joined_at': member.joined_at.isoformat(),
        'can_send_messages': member.can_send_messages,
        'can_send_media': member.can_send_media,
        'can_send_polls': member.can_send_polls,
        'can_invite_users': member.can_invite_users,
        'can_pin_messages': member.can_pin_messages,
        'can_change_info': member.can_change_info,
        'is_anonymous': member.is_anonymous,
    }


def serialize_message(message, current_user=None):
    """سریالایز کردن اطلاعات پیام (نسخه جدید)"""
    data = {
        'id': message.id,
        'chat_id': message.chat.id,
        'sender': serialize_user(message.sender),
        'message_type': message.message_type,
        'content': message.content,
        'media': message.media.url if message.media else None,
        'is_edited': message.is_edited,
        'is_pinned': message.is_pinned,
        'views_count': message.views_count,
        'created_at': message.created_at.isoformat(),
        'edited_at': message.edited_at.isoformat() if message.edited_at else None,
    }
    
    # اطلاعات پاسخ
    if message.reply_to:
        data['reply_to'] = {
            'id': message.reply_to.id,
            'sender': message.reply_to.sender.username,
            'content': message.reply_to.content[:100] + '...' if len(message.reply_to.content) > 100 else message.reply_to.content,
            'message_type': message.reply_to.message_type,
        }
    
    # اطلاعات فوروارد
    if message.forward_from:
        data['forward_from'] = {
            'id': message.forward_from.id,
            'sender': message.forward_from.sender.username,
            'chat_id': message.forward_from.chat.id,
        }
    
    if message.forward_from_chat:
        data['forward_from_chat'] = {
            'id': message.forward_from_chat.id,
            'title': message.forward_from_chat.title,
            'type': message.forward_from_chat.type,
        }
    
    # اطلاعات نظرسنجی
    if message.poll:
        data['poll'] = serialize_poll(message.poll)
    
    # وضعیت مشاهده توسط کاربر جاری
    if current_user and current_user.is_authenticated:
        data['is_viewed'] = MessageView.objects.filter(message=message, user=current_user).exists()
    
    return data


def serialize_poll(poll):
    """سریالایز کردن اطلاعات نظرسنجی"""
    options = poll.options.all()
    total_votes = sum(option.voter_count for option in options)
    
    return {
        'id': poll.id,
        'question': poll.question,
        'type': poll.type,
        'is_anonymous': poll.is_anonymous,
        'allows_multiple_answers': poll.allows_multiple_answers,
        'is_closed': poll.is_closed,
        'close_date': poll.close_date.isoformat() if poll.close_date else None,
        'created_at': poll.created_at.isoformat(),
        'options': [serialize_poll_option(option, total_votes) for option in options],
        'total_votes': total_votes,
        'created_by': serialize_user(poll.created_by),
    }


def serialize_poll_option(option, total_votes=0):
    """سریالایز کردن گزینه نظرسنجی"""
    percentage = (option.voter_count / total_votes * 100) if total_votes > 0 else 0
    
    return {
        'id': option.id,
        'text': option.text,
        'is_correct': option.is_correct,
        'voter_count': option.voter_count,
        'percentage': round(percentage, 1),
    }


# ════════════════════════════════════════════════════════════
# 💬 Basic Chat System Endpoints
# ════════════════════════════════════════════════════════════

@csrf_exempt
@require_http_methods(["POST"])
def create_private_chat(request):
    """ایجاد چت خصوصی با کاربر دیگر"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            data = json.loads(request.body)
            username = data.get('username', '').strip()
            
            if not username:
                return JsonResponse({
                    'success': False,
                    'message': 'Username is required'
                }, status=400)
            
            # پیدا کردن کاربر مورد نظر
            other_user = get_object_or_404(User, username=username)
            
            if other_user == request.user:
                return JsonResponse({
                    'success': False,
                    'message': 'Cannot create chat with yourself'
                }, status=400)
            
            # بررسی وجود چت خصوصی قبلی
            existing_chat = Chat.objects.filter(
                type='private',
                members__user=request.user
            ).filter(
                members__user=other_user
            ).first()
            
            if existing_chat:
                return JsonResponse({
                    'success': True,
                    'message': 'Private chat already exists',
                    'chat': serialize_chat(existing_chat, request.user)
                })
            
            # ایجاد چت خصوصی جدید
            chat = Chat.objects.create(type='private')
            
            # افزودن کاربران به چت
            ChatMember.objects.create(
                chat=chat,
                user=request.user,
                role='member'
            )
            
            ChatMember.objects.create(
                chat=chat,
                user=other_user,
                role='member'
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Private chat created successfully',
                'chat': serialize_chat(chat, request.user)
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
@require_http_methods(["POST"])
def create_group(request):
    """ایجاد گروه جدید"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            data = json.loads(request.body)
            title = data.get('title', '').strip()
            description = data.get('description', '').strip()
            
            if not title:
                return JsonResponse({
                    'success': False,
                    'message': 'Group title is required'
                }, status=400)
            
            # ایجاد گروه
            chat = Chat.objects.create(
                type='group',
                visibility='private',  # گروه‌ها به طور پیش‌فرض خصوصی هستند
                title=title,
                description=description,
            )
            
            # افزودن سازنده به عنوان owner
            ChatMember.objects.create(
                chat=chat,
                user=request.user,
                role='owner',
                can_send_messages=True,
                can_send_media=True,
                can_send_polls=True,
                can_invite_users=True,
                can_pin_messages=True,
                can_change_info=True,
                can_manage_chat=True,
                can_manage_users=True,
                can_delete_messages=True,
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Group created successfully',
                'chat': serialize_chat(chat, request.user)
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


@require_http_methods(["GET"])
def chat_list(request):
    """دریافت لیست چت‌های کاربر"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        # دریافت چت‌هایی که کاربر در آنها عضو است
        user_chats = Chat.objects.filter(members__user=request.user, members__is_member=True)
        
        # فیلتر بر اساس نوع چت
        chat_type = request.GET.get('type')
        if chat_type in ['private', 'group', 'channel']:
            user_chats = user_chats.filter(type=chat_type)
        
        # مرتب‌سازی بر اساس آخرین فعالیت
        user_chats = user_chats.order_by('-updated_at')
        
        page = int(request.GET.get('page', 1))
        per_page = min(int(request.GET.get('per_page', 50)), 100)
        paginator = Paginator(user_chats, per_page)
        
        try:
            chats_page = paginator.page(page)
        except:
            chats_page = paginator.page(1)
        
        return JsonResponse({
            'success': True,
            'chats': [serialize_chat(chat, request.user) for chat in chats_page],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total_pages': paginator.num_pages,
                'total_count': paginator.count,
                'has_next': chats_page.has_next(),
                'has_previous': chats_page.has_previous(),
            }
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@require_http_methods(["GET"])
def chat_detail(request, chat_id):
    """دریافت اطلاعات کامل یک چت"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        chat = get_object_or_404(Chat, id=chat_id)
        
        # بررسی عضویت کاربر
        try:
            member = chat.members.get(user=request.user, is_member=True)
        except ChatMember.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'You are not a member of this chat'
            }, status=403)
        
        # دریافت اعضا
        members = chat.members.filter(is_member=True).select_related('user')
        
        # دریافت آخرین پیام‌ها (۱۰ تای آخر)
        recent_messages = chat.messages.select_related('sender').order_by('-created_at')[:10]
        
        return JsonResponse({
            'success': True,
            'chat': serialize_chat(chat, request.user),
            'members': [serialize_chat_member(m) for m in members],
            'recent_messages': [serialize_message(msg, request.user) for msg in recent_messages],
            'my_role': member.role,
            'my_permissions': {
                'can_send_messages': member.can_send_messages,
                'can_send_media': member.can_send_media,
                'can_send_polls': member.can_send_polls,
                'can_invite_users': member.can_invite_users,
                'can_pin_messages': member.can_pin_messages,
                'can_change_info': member.can_change_info,
            }
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def send_message(request, chat_id):
    """ارسال پیام در چت"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            chat = get_object_or_404(Chat, id=chat_id)
            
            # بررسی عضویت و دسترسی
            try:
                member = chat.members.get(user=request.user, is_member=True)
            except ChatMember.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'You are not a member of this chat'
                }, status=403)
            
            if not member.can_send_messages:
                return JsonResponse({
                    'success': False,
                    'message': 'You do not have permission to send messages in this chat'
                }, status=403)
            
            # بررسی slow mode
            if chat.slow_mode_delay > 0:
                last_message = chat.messages.filter(sender=request.user).order_by('-created_at').first()
                if last_message:
                    time_since_last = timezone.now() - last_message.created_at
                    if time_since_last.total_seconds() < chat.slow_mode_delay:
                        remaining = chat.slow_mode_delay - int(time_since_last.total_seconds())
                        return JsonResponse({
                            'success': False,
                            'message': f'Slow mode active. Please wait {remaining} seconds',
                            'remaining_seconds': remaining
                        }, status=429)
            
            data = request.POST
            message_type = data.get('message_type', 'text')
            content = data.get('content', '').strip()
            reply_to_id = data.get('reply_to')
            
            # اعتبارسنجی
            if message_type == 'text' and not content:
                return JsonResponse({
                    'success': False,
                    'message': 'Message content is required'
                }, status=400)
            
            if message_type not in ['text', 'photo', 'video', 'document', 'voice']:
                return JsonResponse({
                    'success': False,
                    'message': 'Invalid message type'
                }, status=400)
            
            # ایجاد پیام
            message = Message(
                chat=chat,
                sender=request.user,
                message_type=message_type,
                content=content,
            )
            
            # مدیریت پاسخ
            if reply_to_id:
                try:
                    reply_to = Message.objects.get(id=reply_to_id, chat=chat)
                    message.reply_to = reply_to
                except Message.DoesNotExist:
                    pass
            
            # مدیریت مدیا
            if message_type in ['photo', 'video', 'document', 'voice']:
                media_file = request.FILES.get('media')
                if media_file:
                    message.media = media_file
                else:
                    return JsonResponse({
                        'success': False,
                        'message': f'Media file is required for {message_type} messages'
                    }, status=400)
            
            message.save()
            
            # آپدیت زمان چت
            chat.updated_at = timezone.now()
            chat.save()
            
            # ایجاد نوتیفیکیشن برای سایر اعضا
            other_members = chat.members.exclude(user=request.user).filter(is_member=True)
            for member in other_members:
                Notification.objects.create(
                    recipient=member.user,
                    sender=request.user,
                    notif_type='message',
                    message=message,
                    custom_message=f'New message in {chat.title}'
                )
            
            return JsonResponse({
                'success': True,
                'message': 'Message sent successfully',
                'message_data': serialize_message(message, request.user)
            }, status=201)
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@require_http_methods(["GET"])
def chat_messages(request, chat_id):
    """دریافت پیام‌های یک چت"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        chat = get_object_or_404(Chat, id=chat_id)
        
        # بررسی عضویت
        try:
            chat.members.get(user=request.user, is_member=True)
        except ChatMember.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'You are not a member of this chat'
            }, status=403)
        
        # دریافت پیام‌ها
        messages = Message.objects.filter(chat=chat).select_related(
            'sender', 'reply_to', 'forward_from', 'forward_from_chat', 'poll'
        ).order_by('-created_at')
        
        # فیلتر بر اساس نوع پیام
        message_type = request.GET.get('message_type')
        if message_type in ['text', 'photo', 'video', 'document', 'poll', 'voice']:
            messages = messages.filter(message_type=message_type)
        
        # پیام‌های پین شده
        pinned_only = request.GET.get('pinned') == 'true'
        if pinned_only:
            messages = messages.filter(is_pinned=True)
        
        page = int(request.GET.get('page', 1))
        per_page = min(int(request.GET.get('per_page', 50)), 100)
        paginator = Paginator(messages, per_page)
        
        try:
            messages_page = paginator.page(page)
        except:
            messages_page = paginator.page(1)
        
        # علامت‌گذاری پیام‌ها به عنوان مشاهده شده
        for message in messages_page:
            if message.sender != request.user:
                MessageView.objects.get_or_create(message=message, user=request.user)
        
        return JsonResponse({
            'success': True,
            'messages': [serialize_message(msg, request.user) for msg in messages_page],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total_pages': paginator.num_pages,
                'total_count': paginator.count,
                'has_next': messages_page.has_next(),
                'has_previous': messages_page.has_previous(),
            }
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def delete_message(request, message_id):
    """حذف پیام"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            message = get_object_or_404(Message, id=message_id)
            
            # بررسی مالکیت پیام یا دسترسی مدیریت
            try:
                member = message.chat.members.get(user=request.user, is_member=True)
            except ChatMember.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'You are not a member of this chat'
                }, status=403)
            
            can_delete = (message.sender == request.user) or member.can_delete_messages
            
            if not can_delete:
                return JsonResponse({
                    'success': False,
                    'message': 'You do not have permission to delete this message'
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
@require_http_methods(["POST"])
def pin_message(request, message_id):
    """پین کردن پیام"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            message = get_object_or_404(Message, id=message_id)
            
            # بررسی دسترسی
            try:
                member = message.chat.members.get(user=request.user, is_member=True)
            except ChatMember.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'You are not a member of this chat'
                }, status=403)
            
            if not member.can_pin_messages:
                return JsonResponse({
                    'success': False,
                    'message': 'You do not have permission to pin messages'
                }, status=403)
            
            # برداشتن پین قبلی
            Message.objects.filter(chat=message.chat, is_pinned=True).update(is_pinned=False)
            
            # پین کردن پیام جدید
            message.is_pinned = True
            message.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Message pinned successfully'
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def unpin_message(request, message_id):
    """برداشتن پین پیام"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            message = get_object_or_404(Message, id=message_id)
            
            # بررسی دسترسی
            try:
                member = message.chat.members.get(user=request.user, is_member=True)
            except ChatMember.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'You are not a member of this chat'
                }, status=403)
            
            if not member.can_pin_messages:
                return JsonResponse({
                    'success': False,
                    'message': 'You do not have permission to unpin messages'
                }, status=403)
            
            message.is_pinned = False
            message.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Message unpinned successfully'
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


# ════════════════════════════════════════════════════════════
# 📊 Poll System Endpoints
# ════════════════════════════════════════════════════════════

@csrf_exempt
@require_http_methods(["POST"])
def create_poll(request, chat_id):
    """ایجاد نظرسنجی جدید"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            chat = get_object_or_404(Chat, id=chat_id)
            
            # بررسی عضویت و دسترسی
            try:
                member = chat.members.get(user=request.user, is_member=True)
            except ChatMember.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'You are not a member of this chat'
                }, status=403)
            
            if not member.can_send_polls:
                return JsonResponse({
                    'success': False,
                    'message': 'You do not have permission to send polls in this chat'
                }, status=403)
            
            data = json.loads(request.body)
            question = data.get('question', '').strip()
            poll_type = data.get('type', 'regular')
            options = data.get('options', [])
            is_anonymous = data.get('is_anonymous', True)
            allows_multiple_answers = data.get('allows_multiple_answers', False)
            close_date = data.get('close_date')
            
            # اعتبارسنجی
            if not question:
                return JsonResponse({
                    'success': False,
                    'message': 'Poll question is required'
                }, status=400)
            
            if len(options) < 2:
                return JsonResponse({
                    'success': False,
                    'message': 'At least 2 options are required'
                }, status=400)
            
            if len(options) > 10:
                return JsonResponse({
                    'success': False,
                    'message': 'Maximum 10 options allowed'
                }, status=400)
            
            # ایجاد نظرسنجی
            poll = Poll.objects.create(
                created_by=request.user,
                question=question,
                type=poll_type,
                is_anonymous=is_anonymous,
                allows_multiple_answers=allows_multiple_answers,
                close_date=timezone.now() + timedelta(days=1) if close_date is None else close_date,
            )
            
            # ایجاد گزینه‌ها
            for i, option_text in enumerate(options):
                PollOption.objects.create(
                    poll=poll,
                    text=option_text.strip(),
                    is_correct=(i == 0) if poll_type == 'quiz' else False
                )
            
            # ایجاد پیام نظرسنجی
            message = Message.objects.create(
                chat=chat,
                sender=request.user,
                message_type='poll',
                poll=poll,
                content=question  # استفاده از سوال نظرسنجی به عنوان محتوا
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Poll created successfully',
                'poll': serialize_poll(poll),
                'message_id': message.id
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
@require_http_methods(["POST"])
def vote_poll(request, poll_id):
    """رای دادن به نظرسنجی"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            poll = get_object_or_404(Poll, id=poll_id)
            
            # بررسی بسته نبودن نظرسنجی
            if poll.is_closed:
                return JsonResponse({
                    'success': False,
                    'message': 'This poll is closed'
                }, status=400)
            
            data = json.loads(request.body)
            option_ids = data.get('option_ids', [])
            
            if not option_ids:
                return JsonResponse({
                    'success': False,
                    'message': 'At least one option must be selected'
                }, status=400)
            
            # دریافت گزینه‌ها
            options = PollOption.objects.filter(id__in=option_ids, poll=poll)
            if not options.exists():
                return JsonResponse({
                    'success': False,
                    'message': 'Invalid option selected'
                }, status=400)
            
            # بررسی چندگزینه‌ای بودن
            if not poll.allows_multiple_answers and len(option_ids) > 1:
                return JsonResponse({
                    'success': False,
                    'message': 'This poll does not allow multiple answers'
                }, status=400)
            
            # حذف رای‌های قبلی (اگر چندگزینه‌ای نیست)
            if not poll.allows_multiple_answers:
                PollVote.objects.filter(poll=poll, user=request.user).delete()
            
            # ثبت رای‌های جدید
            for option in options:
                # اگر چندگزینه‌ای است، بررسی کن که قبلاً رای نداده باشد
                if poll.allows_multiple_answers:
                    if PollVote.objects.filter(poll=poll, user=request.user, option=option).exists():
                        continue
                
                PollVote.objects.create(
                    poll=poll,
                    user=request.user,
                    option=option
                )
                
                # آپدیت تعداد رای‌های گزینه
                option.voter_count = PollVote.objects.filter(option=option).count()
                option.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Vote submitted successfully',
                'poll': serialize_poll(poll)
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


@require_http_methods(["GET"])
def poll_results(request, poll_id):
    """دریافت نتایج نظرسنجی"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        poll = get_object_or_404(Poll, id=poll_id)
        
        # بررسی اینکه کاربر اجازه دیدن نتایج را دارد
        # (در نظرسنجی‌های ناشناس، فقط سازنده می‌تواند نتایج را ببیند)
        if poll.is_anonymous and poll.created_by != request.user:
            return JsonResponse({
                'success': False,
                'message': 'Results are not available for anonymous polls'
            }, status=403)
        
        return JsonResponse({
            'success': True,
            'poll': serialize_poll(poll),
            'voters_count': PollVote.objects.filter(poll=poll).values('user').distinct().count()
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


# ════════════════════════════════════════════════════════════
# 🔧 Updated Helper Functions
# ════════════════════════════════════════════════════════════

def serialize_notification(notification):
    """سریالایز کردن اطلاعات نوتیفیکیشن (نسخه به‌روز شده)"""
    data = {
        'id': notification.id,
        'sender': notification.sender.username,
        'sender_info': serialize_user(notification.sender, include_sensitive=False),
        'type': notification.notif_type,
        'post_id': notification.post.id if notification.post else None,
        'comment_id': notification.comment.id if notification.comment else None,
        'message_id': notification.message.id if notification.message else None,
        'poll_id': notification.poll.id if notification.poll else None,
        'custom_message': notification.custom_message,
        'is_read': notification.is_read,
        'created_at': notification.created_at.isoformat(),
    }
    
    # افزودن اطلاعات اضافی بر اساس نوع نوتیفیکیشن
    if notification.notif_type == 'message' and notification.message:
        data['chat_id'] = notification.message.chat.id
        data['preview'] = notification.message.content[:100] + '...' if len(notification.message.content) > 100 else notification.message.content
    
    return data


# ════════════════════════════════════════════════════════════
# 🏠 Updated Index Endpoint
# ════════════════════════════════════════════════════════════

@require_http_methods(["GET"])
def index(request):
    """API root endpoint (نسخه به‌روز شده)"""
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
            'chats': {
                'create_private_chat': '/api/chats/create-private/',
                'create_group': '/api/chats/create-group/',
                'chat_list': '/api/chats/',
                'chat_detail': '/api/chats/{chat_id}/',
                'chat_messages': '/api/chats/{chat_id}/messages/',
                'send_message': '/api/chats/{chat_id}/send/',
                'delete_message': '/api/messages/{message_id}/delete/',
                'pin_message': '/api/messages/{message_id}/pin/',
                'unpin_message': '/api/messages/{message_id}/unpin/',
            },
            'polls': {
                'create_poll': '/api/chats/{chat_id}/create-poll/',
                'vote_poll': '/api/polls/{poll_id}/vote/',
                'poll_results': '/api/polls/{poll_id}/results/',
            },
            'notifications': {
                'list': '/api/notifications/',
                'mark_read': '/api/notifications/mark-read/',
            },
        }
    })


# ════════════════════════════════════════════════════════════
# 🔄 Updated Notification Endpoints
# ════════════════════════════════════════════════════════════

@require_http_methods(["GET"])
def notifications_list(request):
    """Get user notifications (نسخه به‌روز شده)"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    notifs = Notification.objects.filter(
        recipient=request.user
    ).select_related('sender', 'post', 'comment', 'message', 'poll').order_by('-created_at')[:100]
    
    return JsonResponse({
        'success': True,
        'notifications': [serialize_notification(n) for n in notifs],
        'unread_count': notifs.filter(is_read=False).count()
    })


# ════════════════════════════════════════════════════════════
# 👥 Chat Management Endpoints
# ════════════════════════════════════════════════════════════

@csrf_exempt
@require_http_methods(["POST"])
def invite_to_chat(request, chat_id):
    """دعوت کاربر به چت (فقط برای چت‌های خصوصی و گروه)"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            chat = get_object_or_404(Chat, id=chat_id)
            
            # بررسی عضویت و دسترسی
            try:
                member = chat.members.get(user=request.user, is_member=True)
            except ChatMember.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'You are not a member of this chat'
                }, status=403)
            
            if not member.can_invite_users:
                return JsonResponse({
                    'success': False,
                    'message': 'You do not have permission to invite users'
                }, status=403)
            
            data = json.loads(request.body)
            username = data.get('username', '').strip()
            
            if not username:
                return JsonResponse({
                    'success': False,
                    'message': 'Username is required'
                }, status=400)
            
            # پیدا کردن کاربر مورد نظر
            user_to_invite = get_object_or_404(User, username=username)
            
            # بررسی اینکه کاربر قبلاً عضو نیست
            if chat.members.filter(user=user_to_invite, is_member=True).exists():
                return JsonResponse({
                    'success': False,
                    'message': 'User is already a member of this chat'
                }, status=400)
            
            # ایجاد عضویت جدید
            ChatMember.objects.create(
                chat=chat,
                user=user_to_invite,
                role='member',
                invited_by=request.user,
                can_send_messages=chat.anyone_can_send_messages,
                can_send_media=True,
                can_send_polls=True,
            )
            
            # آپدیت تعداد اعضا
            chat.update_participants_count()
            
            # ایجاد نوتیفیکیشن برای کاربر دعوت شده
            Notification.objects.create(
                recipient=user_to_invite,
                sender=request.user,
                notif_type='follow',  # استفاده از follow به عنوان نوع عمومی
                custom_message=f'{request.user.username} invited you to {chat.title}'
            )
            
            return JsonResponse({
                'success': True,
                'message': f'User {username} invited successfully'
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
def remove_from_chat(request, chat_id):
    """حذف کاربر از چت"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            chat = get_object_or_404(Chat, id=chat_id)
            
            # بررسی عضویت و دسترسی
            try:
                member = chat.members.get(user=request.user, is_member=True)
            except ChatMember.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'You are not a member of this chat'
                }, status=403)
            
            if not member.can_manage_users:
                return JsonResponse({
                    'success': False,
                    'message': 'You do not have permission to remove users'
                }, status=403)
            
            data = json.loads(request.body)
            username = data.get('username', '').strip()
            
            if not username:
                return JsonResponse({
                    'success': False,
                    'message': 'Username is required'
                }, status=400)
            
            # پیدا کردن کاربر مورد نظر
            user_to_remove = get_object_or_404(User, username=username)
            
            # پیدا کردن عضویت کاربر
            try:
                user_member = chat.members.get(user=user_to_remove, is_member=True)
            except ChatMember.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'User is not a member of this chat'
                }, status=400)
            
            # بررسی سلسله مراتب
            # مالک نمی‌تواند حذف شود
            if user_member.role == 'owner':
                return JsonResponse({
                    'success': False,
                    'message': 'Cannot remove owner from chat'
                }, status=403)
            
            # ادمین‌ها فقط می‌توانند اعضای عادی را حذف کنند
            if member.role == 'admin' and user_member.role == 'admin':
                return JsonResponse({
                    'success': False,
                    'message': 'Admins cannot remove other admins'
                }, status=403)
            
            # حذف کاربر
            user_member.delete()
            
            # آپدیت تعداد اعضا
            chat.update_participants_count()
            
            return JsonResponse({
                'success': True,
                'message': f'User {username} removed from chat successfully'
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
def promote_to_admin(request, chat_id):
    """ارتقای کاربر به ادمین"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            chat = get_object_or_404(Chat, id=chat_id)
            
            # بررسی عضویت و دسترسی
            try:
                member = chat.members.get(user=request.user, is_member=True)
            except ChatMember.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'You are not a member of this chat'
                }, status=403)
            
            if not member.can_promote_members:
                return JsonResponse({
                    'success': False,
                    'message': 'You do not have permission to promote users'
                }, status=403)
            
            data = json.loads(request.body)
            username = data.get('username', '').strip()
            
            if not username:
                return JsonResponse({
                    'success': False,
                    'message': 'Username is required'
                }, status=400)
            
            # پیدا کردن کاربر مورد نظر
            user_to_promote = get_object_or_404(User, username=username)
            
            # پیدا کردن عضویت کاربر
            try:
                user_member = chat.members.get(user=user_to_promote, is_member=True)
            except ChatMember.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'User is not a member of this chat'
                }, status=400)
            
            # بررسی اینکه کاربر قبلاً ادمین نیست
            if user_member.role in ['admin', 'owner']:
                return JsonResponse({
                    'success': False,
                    'message': 'User is already an admin or owner'
                }, status=400)
            
            # ارتقای کاربر به ادمین
            user_member.role = 'admin'
            user_member.can_invite_users = True
            user_member.can_pin_messages = True
            user_member.can_change_info = True
            user_member.can_manage_users = True
            user_member.can_delete_messages = True
            user_member.can_restrict_members = True
            user_member.save()
            
            return JsonResponse({
                'success': True,
                'message': f'User {username} promoted to admin successfully'
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
def demote_to_member(request, chat_id):
    """تنزل ادمین به کاربر عادی"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            chat = get_object_or_404(Chat, id=chat_id)
            
            # بررسی عضویت و دسترسی
            try:
                member = chat.members.get(user=request.user, is_member=True)
            except ChatMember.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'You are not a member of this chat'
                }, status=403)
            
            # فقط مالک می‌تواند ادمین‌ها را تنزل دهد
            if member.role != 'owner':
                return JsonResponse({
                    'success': False,
                    'message': 'Only owner can demote admins'
                }, status=403)
            
            data = json.loads(request.body)
            username = data.get('username', '').strip()
            
            if not username:
                return JsonResponse({
                    'success': False,
                    'message': 'Username is required'
                }, status=400)
            
            # پیدا کردن کاربر مورد نظر
            user_to_demote = get_object_or_404(User, username=username)
            
            # پیدا کردن عضویت کاربر
            try:
                user_member = chat.members.get(user=user_to_demote, is_member=True)
            except ChatMember.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'User is not a member of this chat'
                }, status=400)
            
            # بررسی اینکه کاربر ادمین است
            if user_member.role != 'admin':
                return JsonResponse({
                    'success': False,
                    'message': 'User is not an admin'
                }, status=400)
            
            # تنزل کاربر به عضو عادی
            user_member.role = 'member'
            user_member.can_invite_users = False
            user_member.can_pin_messages = False
            user_member.can_change_info = False
            user_member.can_manage_users = False
            user_member.can_delete_messages = False
            user_member.can_restrict_members = False
            user_member.save()
            
            return JsonResponse({
                'success': True,
                'message': f'User {username} demoted to member successfully'
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
def set_chat_permissions(request, chat_id):
    """تنظیم دسترسی‌های چت"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            chat = get_object_or_404(Chat, id=chat_id)
            
            # بررسی عضویت و دسترسی
            try:
                member = chat.members.get(user=request.user, is_member=True)
            except ChatMember.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'You are not a member of this chat'
                }, status=403)
            
            if not member.can_change_info:
                return JsonResponse({
                    'success': False,
                    'message': 'You do not have permission to change chat settings'
                }, status=403)
            
            data = json.loads(request.body)
            
            # آپدیت تنظیمات چت
            if 'anyone_can_send_messages' in data:
                chat.anyone_can_send_messages = data['anyone_can_send_messages']
            
            if 'anyone_can_add_members' in data:
                chat.anyone_can_add_members = data['anyone_can_add_members']
            
            if 'slow_mode_delay' in data:
                chat.slow_mode_delay = data['slow_mode_delay']
            
            chat.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Chat permissions updated successfully',
                'chat': serialize_chat(chat, request.user)
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
def transfer_ownership(request, chat_id):
    """انتقال مالکیت چت"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            chat = get_object_or_404(Chat, id=chat_id)
            
            # بررسی اینکه کاربر فعلی مالک است
            try:
                current_owner = chat.members.get(user=request.user, role='owner', is_member=True)
            except ChatMember.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'Only owner can transfer ownership'
                }, status=403)
            
            data = json.loads(request.body)
            username = data.get('username', '').strip()
            
            if not username:
                return JsonResponse({
                    'success': False,
                    'message': 'Username is required'
                }, status=400)
            
            # پیدا کردن کاربر جدید برای مالکیت
            new_owner = get_object_or_404(User, username=username)
            
            # پیدا کردن عضویت کاربر جدید
            try:
                new_owner_member = chat.members.get(user=new_owner, is_member=True)
            except ChatMember.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'User is not a member of this chat'
                }, status=400)
            
            # انتقال مالکیت
            current_owner.role = 'admin'  # مالک قبلی به ادمین تبدیل می‌شود
            current_owner.save()
            
            new_owner_member.role = 'owner'
            new_owner_member.can_invite_users = True
            new_owner_member.can_pin_messages = True
            new_owner_member.can_change_info = True
            new_owner_member.can_manage_users = True
            new_owner_member.can_delete_messages = True
            new_owner_member.can_restrict_members = True
            new_owner_member.can_promote_members = True
            new_owner_member.save()
            
            return JsonResponse({
                'success': True,
                'message': f'Ownership transferred to {username} successfully'
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
def leave_chat(request, chat_id):
    """ترک چت (نسخه به‌روز شده با بررسی مالکیت)"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': False,
            'message': 'Authentication required'
        }, status=401)
    
    try:
        with transaction.atomic():
            chat = get_object_or_404(Chat, id=chat_id)
            
            # پیدا کردن عضویت
            try:
                member = chat.members.get(user=request.user, is_member=True)
            except ChatMember.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'You are not a member of this chat'
                }, status=400)
            
            # اگر owner باشد و چت خصوصی نباشد، باید مالکیت را انتقال دهد
            if member.role == 'owner' and chat.type != 'private':
                # بررسی اینکه آیا ادمین دیگری وجود دارد
                other_admins = chat.members.filter(role='admin', is_member=True).exclude(user=request.user)
                
                if other_admins.exists():
                    return JsonResponse({
                        'success': False,
                        'message': 'You must transfer ownership to another admin before leaving'
                    }, status=400)
                else:
                    return JsonResponse({
                        'success': False,
                        'message': 'You must promote another member to admin and transfer ownership before leaving'
                    }, status=400)
            
            # حذف عضویت
            member.delete()
            
            # آپدیت تعداد اعضا
            chat.update_participants_count()
            
            return JsonResponse({
                'success': True,
                'message': f'Left {chat.title} successfully'
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


# ════════════════════════════════════════════════════════════
# 🏠 Updated Index Endpoint with Management Endpoints
# ════════════════════════════════════════════════════════════

@require_http_methods(["GET"])
def index(request):
    """API root endpoint (نسخه نهایی با مدیریت)"""
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
            'chats': {
                'create_private_chat': '/api/chats/create-private/',
                'create_group': '/api/chats/create-group/',
                'chat_list': '/api/chats/',
                'chat_detail': '/api/chats/{chat_id}/',
                'chat_messages': '/api/chats/{chat_id}/messages/',
                'send_message': '/api/chats/{chat_id}/send/',
                'delete_message': '/api/messages/{message_id}/delete/',
                'pin_message': '/api/messages/{message_id}/pin/',
                'unpin_message': '/api/messages/{message_id}/unpin/',
                # مدیریت کاربران
                'invite_user': '/api/chats/{chat_id}/invite/',
                'remove_user': '/api/chats/{chat_id}/remove/',
                'promote_user': '/api/chats/{chat_id}/promote/',
                'demote_user': '/api/chats/{chat_id}/demote/',
                'set_permissions': '/api/chats/{chat_id}/permissions/',
                'transfer_ownership': '/api/chats/{chat_id}/transfer-ownership/',
                'leave_chat': '/api/chats/{chat_id}/leave/',
            },
            'polls': {
                'create_poll': '/api/chats/{chat_id}/create-poll/',
                'vote_poll': '/api/polls/{poll_id}/vote/',
                'poll_results': '/api/polls/{poll_id}/results/',
            },
            'notifications': {
                'list': '/api/notifications/',
                'mark_read': '/api/notifications/mark-read/',
            },
        }
    })