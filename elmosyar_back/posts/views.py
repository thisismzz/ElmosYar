from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.core.paginator import Paginator
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
import json
import mimetypes
import re

import settings
from .models import Post, PostMedia, CategoryFormat, Category
from .serializers import PostSerializer, PostMediaSerializer, CategoryFormatSerializer
from notifications.models import Notification

from interactions.models import Comment
from interactions.serializers import CommentSerializer
from accounts.serializers import UserSerializer

from log_manager.log_config import log_info, log_error, log_warning, log_audit, log_api_request

MAX_POST_CONTENT_LENGTH = 5000
MAX_MEDIA_FILE_SIZE = 10 * 1024 * 1024

# گرفتن مدل کاربر
User = get_user_model()


# ════════════════════════════════════════════════════════════
# 🛠️ Helper Functions
# ════════════════════════════════════════════════════════════

def apply_advanced_search_filter(queryset, search_json, category):
    """
    Apply advanced filters based on JSON search and category format
    """
    try:
        search_criteria = json.loads(search_json)
        
        if not isinstance(search_criteria, dict):
            raise ValidationError('Search criteria must be a JSON object')
        
        if not category:
            raise ValidationError('Category is required for advanced search')
        
        format_obj = CategoryFormat.objects.filter(category=category).first()
        
        if not format_obj:
            raise ValidationError(f'No format found for category: {category}')
        
        try:
            with open(format_obj.format_file.path, 'r', encoding='utf-8') as f:
                format_data = json.load(f)
        except Exception as e:
            log_error(f"Error reading format file: {str(e)}")
            raise ValidationError('Error reading format file')
        
        format_keys = format_data.keys()

        not_empty = True

        matching_keys = {}

        for key_regex in search_criteria.keys():
            matching_keys[key_regex] = []
            for attr_key in format_keys:
                try:
                    # تبدیل کلید format به استرینگ برای تطبیق با regex
                    attr_key_str = str(attr_key)
                    if re.match(key_regex, attr_key_str):
                        matching_keys[key_regex].append(attr_key)
                except re.error:
                    log_error(f"Invalid regex pattern for key matching: {key_regex}")
                    break
            if matching_keys[key_regex] == []:
                not_empty = False
                break
        
        if not not_empty:
            log_info(f"Advanced search applied: 0 posts matched", None, {
            'category': category,
            'search_criteria': search_criteria,
            'matched_posts': 0
            })
            return queryset.filter(id__in=[])

        filtered_posts = []
        for post in queryset:
            post_attributes = post.attributes or {}
            match_all_criteria = True
                
            for regex_key, possible_keys in matching_keys.items():
                match_all_criteria = False
                for key in possible_keys:
                    # تبدیل کلید به استرینگ فقط برای چک کردن وجود
                    key_str = str(key)
                    if key_str in post_attributes:
                        value = post_attributes[key_str]
                        # برای مقادیر مختلف، رفتارهای مختلف:
                        if isinstance(value, (list, dict)):
                            # لیست و دیکشنری را به JSON string تبدیل می‌کنیم
                            value_str = json.dumps(value, ensure_ascii=False)
                        elif value is None:
                            value_str = ""
                        else:
                            # سایر انواع را به استرینگ تبدیل می‌کنیم
                            value_str = str(value)
                        
                        # اعمال regex
                        if re.match(search_criteria[regex_key], value_str):
                            match_all_criteria = True
                            break
                if not match_all_criteria:
                    break
            
            if match_all_criteria:
                filtered_posts.append(post.id)
        
        log_info(f"Advanced search applied: {len(filtered_posts)} posts matched", None, {
            'category': category,
            'search_criteria': search_criteria,
            'matched_posts': len(filtered_posts)
        })
        
        return queryset.filter(id__in=filtered_posts)
        
    except json.JSONDecodeError:
        log_warning(f"Invalid JSON in advanced search: {search_json}")
        raise ValidationError('Invalid JSON in search parameter')
    except ValidationError as e:
        log_warning(f"Advanced search validation error: {str(e)}")
        raise e
    except Exception as e:
        log_error(f"Advanced search error: {str(e)}")
        raise ValidationError('Error in advanced search')


def validate_post_attributes(attributes, category):
    """
    Validate post attributes based on category format
    """
    if not attributes or not category:
        return True, None
    
    format_obj = CategoryFormat.objects.filter(category=category).first()
    if not format_obj:
        return True, None
    
    try:
        with open(format_obj.format_file.path, 'r', encoding='utf-8') as f:
            format_data = json.load(f)
        
        # یک کپی از attributes برای validation ایجاد می‌کنیم
        # تا تغییرات روی رفرنس اصلی اعمال نشود
        attrs_for_validation = {}
        for key, value in attributes.items():
            # کلید را به استرینگ تبدیل می‌کنیم (فقط برای validation)
            key_str = str(key)
            attrs_for_validation[key_str] = value
        
        for key_str, value in attrs_for_validation.items():
            # کلید format_data هم به استرینگ تبدیل می‌کنیم برای تطبیق
            format_keys = [str(k) for k in format_data.keys()]
            if key_str in format_keys:
                # پیدا کردن الگوی اصلی (با کلید اصلی)
                original_key = None
                for k in format_data.keys():
                    if str(k) == key_str:
                        original_key = k
                        break
                
                if original_key:
                    pattern = format_data[original_key]
                    # آماده‌سازی مقدار برای validation
                    if isinstance(value, (list, dict)):
                        # لیست و دیکشنری را به JSON string تبدیل می‌کنیم
                        value_to_check = json.dumps(value, ensure_ascii=False)
                    elif value is None:
                        value_to_check = ""
                    else:
                        # سایر انواع را به استرینگ تبدیل می‌کنیم
                        value_to_check = str(value)
                    
                    if not re.match(pattern, value_to_check):
                        log_warning(f"Attribute validation failed: {key_str}={value} doesn't match pattern")
                        return False, f'Attribute "{key_str}" does not match format pattern'
        
        return True, None
    except Exception as e:
        log_error(f"Format validation error: {str(e)}", None, {'category': category})
        return False, f'Error validating format: {str(e)}'


def validate_post_update_attributes(post, attributes, category):
    """
    Validate attributes for post update
    """
    if not category:
        return True, None
    
    format_obj = CategoryFormat.objects.filter(category=category).first()
    if not format_obj:
        return True, None
    
    try:
        with open(format_obj.format_file.path, 'r', encoding='utf-8') as f:
            format_data = json.load(f)
        
        if attributes is not None:
            post_attributes = post.attributes or {}
            
            # یک کپی از merged attributes ایجاد می‌کنیم
            merged_attributes = {}
            
            # اول post_attributes را اضافه می‌کنیم
            for key, value in post_attributes.items():
                key_str = str(key)
                merged_attributes[key_str] = value
            
            # سپس attributes جدید را اضافه می‌کنیم (با تبدیل کلیدها)
            for key, value in attributes.items():
                key_str = str(key)
                merged_attributes[key_str] = value
            
            # لیست کلیدهای format_data به صورت استرینگ
            format_keys_str = [str(k) for k in format_data.keys()]
            
            for key_str, value in merged_attributes.items():
                if key_str in format_keys_str:
                    # پیدا کردن الگوی اصلی
                    original_key = None
                    for k in format_data.keys():
                        if str(k) == key_str:
                            original_key = k
                            break
                    
                    if original_key:
                        pattern = format_data[original_key]
                        # آماده‌سازی مقدار برای validation
                        if isinstance(value, (list, dict)):
                            # لیست و دیکشنری را به JSON string تبدیل می‌کنیم
                            value_to_check = json.dumps(value, ensure_ascii=False)
                        elif value is None:
                            value_to_check = ""
                        else:
                            # سایر انواع را به استرینگ تبدیل می‌کنیم
                            value_to_check = str(value)
                        
                        if not re.match(pattern, value_to_check):
                            log_warning(f"Update attribute validation failed: {key_str}={value}")
                            return False, f'Attribute "{key_str}" does not match format pattern'
            
            # بررسی وجود کلیدهای اجباری (با تبدیل به استرینگ)
            for original_key, pattern in format_data.items():
                key_str = str(original_key)
                if key_str not in merged_attributes:
                    log_warning(f"Required attribute missing: {key_str}")
                    return False, f'Attribute "{key_str}" is required and cannot be removed'
        
        return True, None
    except Exception as e:
        log_error(f"Format validation error for update: {str(e)}", None, {
            'post_id': post.id,
            'category': category
        })
        return False, f'Error validating format: {str(e)}'


def can_user_modify_post(user, post):
    """
    بررسی می‌کند که آیا کاربر می‌تواند پست را ویرایش یا حذف کند
    برای کتگوری‌های ناشناس، کاربر نمی‌تواند پست خودش را حذف/ویرایش کند
    """
    if post.category and post.category.anonymous:
        # در کتگوری ناشناس، کاربر نمی‌تواند پست خودش را حذف/ویرایش کند
        # (چون نویسنده ناشناس است)
        return False
    
    # در کتگوری معمولی، فقط نویسنده می‌تواند پست را حذف/ویرایش کند
    return post.author == user


# ════════════════════════════════════════════════════════════
# 📝 Post Endpoints
# ════════════════════════════════════════════════════════════

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def posts_list_create(request):
    """List all posts or create new post"""
    
    if request.method == 'GET':
        category_name = request.GET.get('category')
        username = request.GET.get('username')
        search_json = request.GET.get('search')
        page = int(request.GET.get('page', 1))
        per_page = min(int(request.GET.get('per_page', 20)), 100)

        posts = Post.objects.all()
        
        if category_name:
            posts = posts.filter(category__name=category_name)
        
        if username:
            try:
                user = User.objects.get(username=username)
                posts = posts.filter(author=user)
                posts = posts.exclude(category__anonymous=True)
            except User.DoesNotExist:
                # کاربر وجود ندارد، لیست خالی برگردان
                posts = Post.objects.none()
                log_info(f"User not found: {username}, returning empty posts list", request)
            
        if search_json:
            try:
                posts = apply_advanced_search_filter(posts, search_json, category_name)
            except ValidationError as e:
                log_warning(f"Advanced search validation error: {str(e)}", request)
                return Response({
                    'success': False,
                    'message': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        
        posts = posts.select_related('author', 'category').prefetch_related(
            'media', 'mentions', 'reactions', 'saved_by'
        ).order_by('-created_at')
        
        paginator = Paginator(posts, per_page)
        try:
            posts_page = paginator.page(page)
        except:
            posts_page = paginator.page(1)
        
        log_api_request(f"Posts list retrieved", request, {
            'category': category_name,
            'username': username,
            'has_search': bool(search_json),
            'page': page,
            'per_page': per_page,
            'total_posts': paginator.count
        })
        
        serializer = PostSerializer(posts_page, many=True, context={'request': request})
        
        return Response({
            'success': True,
            'posts': serializer.data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total_pages': paginator.num_pages,
                'total_count': paginator.count,
                'has_next': posts_page.has_next(),
                'has_previous': posts_page.has_previous(),
            }
        }, status=status.HTTP_200_OK)
    
    # POST - Create new post
    try:
        with transaction.atomic():
            mentions_raw = request.data.get('mentions', '').strip()
            parent_id = request.data.get('parent')
            category_name = request.data.get('category', '').strip()
            attributes = request.data.get('attributes', {})

            if not request.FILES and not attributes:
                log_warning("Post creation attempt without media or attributes", request)
                return Response({
                    'success': False,
                    'message': 'Post media or attributes required'
                }, status=status.HTTP_400_BAD_REQUEST)

            parent = None
            if parent_id:
                parent = Post.objects.filter(id=parent_id).first()

            if not parent and not category_name:
                log_warning("Post creation without category for main post", request)
                return Response({
                    'success': False,
                    'message': 'Category is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            category = None
            if category_name:
                category, created = Category.objects.get_or_create(
                    name=category_name,
                    defaults={'anonymous': False}
                )
                if created:
                    log_info(f"New category created: {category_name}", request)

            if attributes and category_name:
                if isinstance(attributes, str):
                    try:
                        attributes = json.loads(attributes)
                    except json.JSONDecodeError:
                        log_warning(f"Invalid JSON in attributes string", request)
                        return Response({
                            'success': False,
                            'message': 'Attributes must be valid JSON'
                        }, status=status.HTTP_400_BAD_REQUEST)
                
                is_valid, error_message = validate_post_attributes(attributes, category_name)
                if not is_valid:
                    log_warning(f"Post attributes validation failed: {error_message}", request, {
                        'category': category_name,
                        'attributes': attributes
                    })
                    return Response({
                        'success': False,
                        'message': error_message
                    }, status=status.HTTP_400_BAD_REQUEST)

            post = Post.objects.create(
                author=request.user,
                parent=parent,
                category=category,
                attributes=attributes
            )

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
                log_info(f"Post mentions added: {len(mentioned_users)} users", request, {
                    'mentioned_users': usernames
                })

            media_files = []
            for f in request.FILES.getlist('media'):
                ctype = f.content_type or mimetypes.guess_type(f.name)[0] or ''
                if ctype.startswith('image/'):
                    mtype = 'image'
                elif ctype.startswith('video/'):
                    mtype = 'video'
                elif ctype.startswith('audio/'):
                    mtype = 'audio'
                else:
                    mtype = 'file'
                
                if f.size > MAX_MEDIA_FILE_SIZE:
                    log_warning(f"Media file too large: {f.size} bytes, skipping", request, {
                        'filename': f.name,
                        'max_allowed': MAX_MEDIA_FILE_SIZE
                    })
                    continue
                    
                PostMedia.objects.create(post=post, file=f, media_type=mtype)
                media_files.append({
                    'filename': f.name,
                    'size': f.size,
                    'type': mtype
                })

            log_audit(f"Post created successfully", request, {
                'post_id': post.id,
                'category': category_name,
                'has_media': len(media_files) > 0,
                'media_count': len(media_files),
                'has_parent': parent is not None,
                'parent_id': parent.id if parent else None,
                'has_attributes': bool(attributes),
                'is_anonymous_category': category.anonymous if category else False
            })

            serializer = PostSerializer(post, context={'request': request})
            return Response({
                'success': True,
                'post': serializer.data
            }, status=status.HTTP_201_CREATED)

    except Exception as e:
        log_error(f"Post creation failed: {str(e)}", request, {
            'category': category_name if 'category_name' in locals() else None,
            'has_media': bool(request.FILES)
        })
        return Response({
            'success': False,
            'message': 'Failed to create post'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def post_detail(request, post_id):
    """Get single post details with comments and replies"""
    try:
        post = get_object_or_404(
            Post.objects.select_related('author', 'category')
            .prefetch_related('media', 'mentions', 'reactions', 'saved_by'),
            id=post_id
        )
        
        # ✅ اصلاح شده: کاربران واردشده می‌توانند پست‌های کتگوری ناشناس را ببینند
        # فقط اطلاعات author و mentions در سریالایزر مخفی می‌شود
        log_info(f"Post details viewed", request, {
            'post_id': post_id,
            'author': post.author.username if post.author else 'anonymous',
            'category': post.category.name if post.category else None,
            'is_anonymous_category': post.category.anonymous if post.category else False
        })
        
        post_serializer = PostSerializer(post, context={'request': request})
        data = post_serializer.data
        
        # برای کتگوری‌های ناشناس، اطلاعات author و mentions باید مخفی باشند
        # که این کار در سریالایزر انجام شده است
        
        comments = Comment.objects.filter(post=post).select_related('user').prefetch_related('likes').order_by('created_at')
        comment_serializer = CommentSerializer(comments, many=True, context={'request': request})
        data['comments'] = comment_serializer.data
        
        replies = Post.objects.filter(parent=post).select_related('author', 'category').prefetch_related(
            'media', 'mentions', 'reactions'
        ).order_by('created_at')
        reply_serializer = PostSerializer(replies, many=True, context={'request': request})
        data['replies'] = reply_serializer.data
        
        return Response({
            'success': True,
            'post': data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        log_error(f"Post detail retrieval failed: {str(e)}", request, {'post_id': post_id})
        return Response({
            'success': False,
            'message': 'Failed to get post details'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_post(request, post_id):
    """Delete a post"""
    try:
        with transaction.atomic():
            post = get_object_or_404(Post, id=post_id)
            
            # ✅ اصلاح شده: استفاده از تابع کمکی برای بررسی اجازه حذف
            if not can_user_modify_post(request.user, post):
                log_warning(f"User attempted to delete post they cannot modify", request, {
                    'post_id': post_id,
                    'post_author': post.author.username if post.author else 'anonymous',
                    'is_anonymous_category': post.category.anonymous if post.category else False
                })
                
                if post.category and post.category.anonymous:
                    return Response({
                        'success': False,
                        'message': 'Cannot delete posts in anonymous categories'
                    }, status=status.HTTP_403_FORBIDDEN)
                else:
                    return Response({
                        'success': False,
                        'message': 'You can only delete your own posts'
                    }, status=status.HTTP_403_FORBIDDEN)
            
            post_category = post.category.name if post.category else None
            post_author = post.author.username if post.author else 'anonymous'
            has_media = post.media.exists()
            is_anonymous = post.category.anonymous if post.category else False
            
            post.delete()
            
            log_audit(f"Post deleted", request, {
                'post_id': post_id,
                'category': post_category,
                'author': post_author,
                'had_media': has_media,
                'was_anonymous': is_anonymous
            })
            
            return Response({
                'success': True,
                'message': 'Post deleted successfully'
            }, status=status.HTTP_200_OK)
    except Exception as e:
        log_error(f"Post deletion failed: {str(e)}", request, {'post_id': post_id})
        return Response({
            'success': False,
            'message': 'Failed to delete post'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_post(request, post_id):
    """Update a post"""
    try:
        with transaction.atomic():
            post = get_object_or_404(Post, id=post_id)
            
            # ✅ اصلاح شده: استفاده از تابع کمکی برای بررسی اجازه ویرایش
            if not can_user_modify_post(request.user, post):
                log_warning(f"User attempted to edit post they cannot modify", request, {
                    'post_id': post_id,
                    'post_author': post.author.username if post.author else 'anonymous',
                    'is_anonymous_category': post.category.anonymous if post.category else False
                })
                
                if post.category and post.category.anonymous:
                    return Response({
                        'success': False,
                        'message': 'Cannot edit posts in anonymous categories'
                    }, status=status.HTTP_403_FORBIDDEN)
                else:
                    return Response({
                        'success': False,
                        'message': 'You can only edit your own posts'
                    }, status=status.HTTP_403_FORBIDDEN)
            
            category_name = request.data.get('category')
            attributes = request.data.get('attributes')
            
            if category_name:
                category, created = Category.objects.get_or_create(
                    name=category_name,
                    defaults={'anonymous': False}
                )
                request.data['category'] = category.id
                current_category = category_name
            else:
                current_category = post.category.name if post.category else None
            
            if current_category and attributes is not None:
                is_valid, error_message = validate_post_update_attributes(post, attributes, current_category)
                if not is_valid:
                    log_warning(f"Post update validation failed: {error_message}", request, {
                        'post_id': post_id,
                        'category': current_category
                    })
                    return Response({
                        'success': False,
                        'message': error_message
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = PostSerializer(post, data=request.data, partial=True, context={'request': request})
            
            if serializer.is_valid():
                old_category = post.category.name if post.category else None
                
                serializer.save()
                
                changes = {}
                if category_name and category_name != old_category:
                    changes['category_changed'] = True
                if attributes:
                    changes['attributes_updated'] = True
                
                log_audit(f"Post updated", request, {
                    'post_id': post_id,
                    **changes,
                    'new_category': category_name or (post.category.name if post.category else None),
                    'is_anonymous_category': post.category.anonymous if post.category else False
                })
                
                return Response({
                    'success': True,
                    'message': 'Post updated successfully',
                    'post': serializer.data
                }, status=status.HTTP_200_OK)
            else:
                log_warning(f"Post update validation failed", request, {
                    'post_id': post_id,
                    'errors': serializer.errors
                })
                return Response({
                    'success': False,
                    'message': 'Validation failed',
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
    except Exception as e:
        log_error(f"Post update failed: {str(e)}", request, {'post_id': post_id})
        return Response({
            'success': False,
            'message': 'Failed to update post'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def post_repost(request, post_id):
    """Repost a post"""
    try:
        with transaction.atomic():
            original_post = get_object_or_404(Post, id=post_id)
            
            # ✅ اصلاح شده: کاربران می‌توانند از کتگوری‌های ناشناس ریپوست کنند
            # اما باید دقت کرد که اطلاعات نویسنده مخفی بماند
            if original_post.category and original_post.category.anonymous:
                log_info(f"User reposting from anonymous category", request, {
                    'post_id': post_id,
                    'category': original_post.category.name
                })
                # اجازه ریپوست از کتگوری ناشناس داده می‌شود
            
            if original_post.author == request.user:
                log_warning(f"User attempted to repost their own post", request, {'post_id': post_id})
                return Response({
                    'success': False,
                    'message': 'You cannot repost your own post'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            existing_repost = Post.objects.filter(
                author=request.user, 
                original_post=original_post,
                is_repost=True
            ).exists()
            
            if existing_repost:
                log_warning(f"User attempted to repost same post again", request, {'post_id': post_id})
                return Response({
                    'success': False,
                    'message': 'You have already reposted this post'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            new_post = Post.objects.create(
                author=request.user,
                is_repost=True,
                original_post=original_post,
                category=original_post.category,
                attributes=original_post.attributes
            )
            
            for mu in original_post.mentions.all():
                new_post.mentions.add(mu)
            
            # فقط اگر پست اصلی در کتگوری معمولی باشد، نوتیفیکیشن ایجاد کن
            if not (original_post.category and original_post.category.anonymous):
                Notification.objects.create(
                    recipient=original_post.author,
                    sender=request.user,
                    notif_type='repost',
                    post=original_post,
                    message=f'{request.user.username} reposted your post'
                )
            
            log_audit(f"Post reposted", request, {
                'original_post_id': post_id,
                'repost_id': new_post.id,
                'original_author': original_post.author.username if original_post.author else 'anonymous',
                'category': original_post.category.name if original_post.category else None,
                'is_anonymous_category': original_post.category.anonymous if original_post.category else False
            })
            
            serializer = PostSerializer(new_post, context={'request': request})
            
            return Response({
                'success': True,
                'post': serializer.data
            }, status=status.HTTP_201_CREATED)
    except Exception as e:
        log_error(f"Repost failed: {str(e)}", request, {'post_id': post_id})
        return Response({
            'success': False,
            'message': 'Failed to repost'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def posts_by_category(request, category_id):
    """Get posts by category/room with pagination"""
    page = int(request.GET.get('page', 1))
    per_page = min(int(request.GET.get('per_page', 20)), 100)
    
    posts = Post.objects.filter(
        category__name=category_id,
        parent=None
    ).select_related('author', 'category').prefetch_related(
        'media', 'mentions', 'reactions'
    ).order_by('-created_at')
    
    # ✅ اصلاح شده: حذف فیلتر کردن پست‌های کتگوری ناشناس
    # کاربران واردشده می‌توانند پست‌های کتگوری ناشناس را ببینند
    # if request.user.is_authenticated:
    #     posts = posts.exclude(category__anonymous=True)
    
    paginator = Paginator(posts, per_page)
    try:
        posts_page = paginator.page(page)
    except:
        posts_page = paginator.page(1)
    
    log_api_request(f"Posts by category viewed", request, {
        'category': category_id,
        'page': page,
        'per_page': per_page,
        'total_posts': paginator.count
    })
    
    serializer = PostSerializer(posts_page, many=True, context={'request': request})
    
    return Response({
        'success': True,
        'posts': serializer.data,
        'category': category_id,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total_pages': paginator.num_pages,
            'total_count': paginator.count,
            'has_next': posts_page.has_next(),
            'has_previous': posts_page.has_previous(),
        }
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def user_posts(request, username):
    """Get posts by specific user with pagination"""
    user = get_object_or_404(User, username=username)
    
    page = int(request.GET.get('page', 1))
    per_page = min(int(request.GET.get('per_page', 20)), 100)
    
    posts = Post.objects.filter(
        author=user,
        parent=None
    ).select_related('author', 'category').prefetch_related(
        'media', 'mentions', 'reactions'
    ).order_by('-created_at')
    
    posts = posts.exclude(category__anonymous=True)
    
    paginator = Paginator(posts, per_page)
    try:
        posts_page = paginator.page(page)
    except:
        posts_page = paginator.page(1)
    
    log_api_request(f"User posts viewed", request, {
        'target_user': username,
        'page': page,
        'per_page': per_page,
        'total_posts': paginator.count
    })
    
    user_serializer = UserSerializer(user, context={'request': request})
    posts_serializer = PostSerializer(posts_page, many=True, context={'request': request})
    
    return Response({
        'success': True,
        'posts': posts_serializer.data,
        'username': username,
        'user': user_serializer.data,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total_pages': paginator.num_pages,
            'total_count': paginator.count,
            'has_next': posts_page.has_next(),
            'has_previous': posts_page.has_previous(),
        }
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def post_thread(request, post_id):
    """Get post thread (post with all its replies)"""
    try:
        post = get_object_or_404(
            Post.objects.select_related('author', 'category').prefetch_related('media', 'mentions'),
            id=post_id
        )
        
        # ✅ اصلاح شده: کاربران واردشده می‌توانند پست‌های کتگوری ناشناس را ببینند
        # if request.user.is_authenticated and post.category and post.category.anonymous:
        #     log_warning(f"Authenticated user attempted to access anonymous category post thread", request, {
        #         'post_id': post_id
        #     })
        #     return Response({
        #         'success': False,
        #         'message': 'Access to posts in anonymous categories is not allowed for authenticated users'
        #     }, status=status.HTTP_403_FORBIDDEN)
        
        log_api_request(f"Post thread viewed", request, {
            'post_id': post_id,
            'author': post.author.username if post.author else 'anonymous',
            'category': post.category.name if post.category else None,
            'is_anonymous_category': post.category.anonymous if post.category else False
        })
        
        post_serializer = PostSerializer(post, context={'request': request})
        data = post_serializer.data
        
        replies = post.replies.select_related('author', 'category').prefetch_related(
            'media', 'mentions', 'reactions'
        ).order_by('created_at')
        replies_serializer = PostSerializer(replies, many=True, context={'request': request})
        data['replies'] = replies_serializer.data
        
        return Response({
            'success': True,
            'thread': data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        log_error(f"Post thread retrieval failed: {str(e)}", request, {'post_id': post_id})
        return Response({
            'success': False,
            'message': 'Failed to get post thread'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_post(request, post_id):
    """Save a post"""
    try:
        with transaction.atomic():
            post = get_object_or_404(Post, id=post_id)
            
            # ✅ اصلاح شده: کاربران می‌توانند پست‌های کتگوری ناشناس را ذخیره کنند
            # if post.category and post.category.anonymous:
            #     log_warning(f"User attempted to save post in anonymous category", request, {
            #         'post_id': post_id,
            #         'category': post.category.name
            #     })
            #     return Response({
            #         'success': False,
            #         'message': 'Cannot save posts in anonymous categories'
            #     }, status=status.HTTP_403_FORBIDDEN)
            
            if post.saved_by.filter(id=request.user.id).exists():
                log_warning(f"User attempted to save already saved post", request, {'post_id': post_id})
                return Response({
                    'success': False,
                    'message': 'Post already saved'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            post.saved_by.add(request.user)
            
            log_audit(f"Post saved", request, {
                'post_id': post_id,
                'author': post.author.username if post.author else 'anonymous',
                'category': post.category.name if post.category else None,
                'is_anonymous_category': post.category.anonymous if post.category else False
            })
            
            return Response({
                'success': True,
                'message': 'Post saved successfully'
            }, status=status.HTTP_200_OK)
    except Exception as e:
        log_error(f"Save post failed: {str(e)}", request, {'post_id': post_id})
        return Response({
            'success': False,
            'message': 'Failed to save post'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unsave_post(request, post_id):
    """Unsave a post"""
    try:
        with transaction.atomic():
            post = get_object_or_404(Post, id=post_id)
            
            # ✅ اصلاح شده: کاربران می‌توانند پست‌های کتگوری ناشناس را از ذخیره‌ها حذف کنند
            # if post.category and post.category.anonymous:
            #     log_warning(f"User attempted to unsave post in anonymous category", request, {
            #         'post_id': post_id,
            #         'category': post.category.name
            #     })
            #     return Response({
            #         'success': False,
            #         'message': 'Cannot unsave posts in anonymous categories'
            #     }, status=status.HTTP_403_FORBIDDEN)
            
            if not post.saved_by.filter(id=request.user.id).exists():
                log_warning(f"User attempted to unsave non-saved post", request, {'post_id': post_id})
                return Response({
                    'success': False,
                    'message': 'Post not saved'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            post.saved_by.remove(request.user)
            
            log_audit(f"Post unsaved", request, {
                'post_id': post_id,
                'author': post.author.username if post.author else 'anonymous',
                'category': post.category.name if post.category else None,
                'is_anonymous_category': post.category.anonymous if post.category else False
            })
            
            return Response({
                'success': True,
                'message': 'Post unsaved successfully'
            }, status=status.HTTP_200_OK)
    except Exception as e:
        log_error(f"Unsave post failed: {str(e)}", request, {'post_id': post_id})
        return Response({
            'success': False,
            'message': 'Failed to unsave post'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def saved_posts(request):
    """Get user's saved posts with pagination"""
    page = int(request.GET.get('page', 1))
    per_page = min(int(request.GET.get('per_page', 20)), 100)
    
    saved_posts = request.user.saved_posts.filter(parent=None).select_related('author', 'category').prefetch_related(
        'media', 'mentions', 'reactions'
    ).order_by('-created_at')
    
    # ✅ اصلاح شده: حذف فیلتر کردن پست‌های کتگوری ناشناس
    # کاربر می‌تواند پست‌های ذخیره شده در کتگوری ناشناس را هم ببیند
    # saved_posts = saved_posts.exclude(category__anonymous=True)
    
    paginator = Paginator(saved_posts, per_page)
    try:
        saved_posts_page = paginator.page(page)
    except:
        saved_posts_page = paginator.page(1)
    
    log_info(f"Saved posts viewed", request, {
        'page': page,
        'per_page': per_page,
        'total_saved': paginator.count
    })
    
    serializer = PostSerializer(saved_posts_page, many=True, context={'request': request})
    
    return Response({
        'success': True,
        'posts': serializer.data,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total_pages': paginator.num_pages,
            'total_count': paginator.count,
            'has_next': saved_posts_page.has_next(),
            'has_previous': saved_posts_page.has_previous(),
        }
    }, status=status.HTTP_200_OK)


# ════════════════════════════════════════════════════════════
# 📁 Category Format Endpoints
# ════════════════════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_category_format(request):
    """Upload format file for a category (superusers only)"""
    if not request.user.is_superuser:
        log_warning(f"Non-superuser attempted to upload format file", request)
        return Response({
            'success': False,
            'message': 'Only superusers can upload format files'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        category = request.data.get('category', '').strip()
        format_file = request.FILES.get('format_file')

        if not category:
            log_warning(f"Format upload without category", request)
            return Response({
                'success': False,
                'message': 'Category is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        if not format_file:
            log_warning(f"Format upload without file", request)
            return Response({
                'success': False,
                'message': 'Format file is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        if not format_file.name.endswith('.json'):
            log_warning(f"Non-JSON file upload attempt: {format_file.name}", request)
            return Response({
                'success': False,
                'message': 'Only JSON files are allowed'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            format_file.seek(0)
            format_data = json.load(format_file)
            format_file.seek(0)
        except json.JSONDecodeError as e:
            log_warning(f"Invalid JSON file: {str(e)}", request)
            return Response({
                'success': False,
                'message': 'Invalid JSON file'
            }, status=status.HTTP_400_BAD_REQUEST)

        format_obj, created = CategoryFormat.objects.update_or_create(
            category=category,
            defaults={
                'format_file': format_file,
                'created_by': request.user
            }
        )

        log_audit(f"Category format uploaded/updated", request, {
            'category': category,
            'created_flag': created,
            'format_id': format_obj.id,
            'file_size': format_file.size,
            'keys_count': len(format_data.keys()) if format_data else 0
        })

        serializer = CategoryFormatSerializer(format_obj, context={'request': request})
        
        return Response({
            'success': True,
            'message': 'Format uploaded successfully' if created else 'Format updated successfully',
            'format': serializer.data
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        log_error(f"Format upload failed: {str(e)}", request)
        detail = str(e) if getattr(settings, 'DEBUG', False) else 'Failed to upload format'
        return Response({
            'success': False,
            'message': 'Failed to upload format',
            'error': detail
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_category_format(request, cat):
    """Delete format file for a category (superusers only)"""
    if not request.user.is_superuser:
        log_warning(f"Non-superuser attempted to delete format file", request, {'category': cat})
        return Response({
            'success': False,
            'message': 'Only superusers can delete format files'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        format_obj = CategoryFormat.objects.filter(category=cat).first()
        
        if not format_obj:
            log_warning(f"Attempt to delete non-existent format", request, {'category': cat})
            return Response({
                'success': False,
                'message': f'No format found for category: {cat}'
            }, status=status.HTTP_404_NOT_FOUND)

        format_obj.delete()
        
        log_audit(f"Category format deleted", request, {'category': cat})
        
        return Response({
            'success': True,
            'message': 'Format deleted successfully'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        log_error(f"Format deletion failed: {str(e)}", request, {'category': cat})
        return Response({
            'success': False,
            'message': 'Failed to delete format'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_format(request, cat):
    """Get format file for a category (for all users)"""
    try:
        format_obj = CategoryFormat.objects.filter(category=cat).first()
        
        if not format_obj or not format_obj.format_file:
            log_warning(f"Format requested for non-existent category", request, {'category': cat})
            return Response({
                'success': False,
                'message': f'No format found for category: {cat}'
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            with open(format_obj.format_file.path, 'r', encoding='utf-8') as f:
                format_data = json.load(f)
        except Exception as e:
            log_error(f"Error reading format file: {str(e)}", request, {'category': cat})
            return Response({
                'success': False,
                'message': 'Error reading format file'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        category_obj = Category.objects.filter(name=cat).first()
        is_anonymous = category_obj.anonymous if category_obj else False

        log_info(f"Format file retrieved", request, {
            'category': cat,
            'keys_count': len(format_data.keys()) if format_data else 0,
            'last_updated': format_obj.updated_at,
            'is_anonymous': is_anonymous
        })

        return Response({
            'success': True,
            'category': cat,
            'format': format_data,
            'last_updated': format_obj.updated_at,
            'is_anonymous': is_anonymous
        }, status=status.HTTP_200_OK)

    except Exception as e:
        log_error(f"Get format failed: {str(e)}", request, {'category': cat})
        return Response({
            'success': False,
            'message': 'Failed to get format'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def get_format_data(cat):
    """Helper function to get format data from anywhere in the app"""
    try:
        format_obj = CategoryFormat.objects.filter(category=cat).first()
        if format_obj and format_obj.format_file:
            with open(format_obj.format_file.path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return None
    except Exception as e:
        log_error(f"Error in get_format_data for {cat}: {str(e)}")
        return None