from django.contrib import admin
from django.utils.html import format_html
from .models import Post, PostMedia, CategoryFormat, Category


class PostMediaInline(admin.TabularInline):
    model = PostMedia
    extra = 1
    fields = ['file', 'media_type', 'caption', 'order']
    readonly_fields = ['created_at']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'anonymous', 'created_at', 'updated_at']
    list_filter = ['anonymous', 'created_at']
    search_fields = ['name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Category Information', {
            'fields': ('name', 'anonymous')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'author', 'category', 'has_media', 'is_repost', 
        'likes_count', 'dislikes_count', 'comments_count', 'created_at'
    ]
    list_filter = ['category', 'is_repost', 'created_at']
    search_fields = ['author__username', 'category__name']
    readonly_fields = ['created_at', 'updated_at', 'likes_count', 'dislikes_count', 'comments_count']
    date_hierarchy = 'created_at'
    filter_horizontal = ['mentions', 'saved_by']
    inlines = [PostMediaInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('author', 'category', 'attributes')
        }),
        ('Repost', {
            'fields': ('is_repost', 'original_post'),
            'classes': ('collapse',)
        }),
        ('Reply to Post', {
            'fields': ('parent',),
            'classes': ('collapse',)
        }),
        ('Mentions and Saves', {
            'fields': ('mentions', 'saved_by'),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': ('likes_count', 'dislikes_count', 'comments_count'),
            'classes': ('collapse',)
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def has_media(self, obj):
        has_extra_media = obj.media.exists()
        
        if has_extra_media:
            return format_html('<span style="color: green;">✓</span>')
        return format_html('<span style="color: red;">✗</span>')
    has_media.short_description = 'Media'


@admin.register(PostMedia)
class PostMediaAdmin(admin.ModelAdmin):
    list_display = ['id', 'post', 'media_type', 'caption', 'order', 'created_at']
    list_filter = ['media_type', 'created_at']
    search_fields = ['post__id', 'caption']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Media Information', {
            'fields': ('post', 'file', 'media_type', 'caption', 'order')
        }),
        ('Date', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(CategoryFormat)
class CategoryFormatAdmin(admin.ModelAdmin):
    list_display = ['category', 'created_by', 'created_at', 'updated_at']
    list_filter = ['created_at']
    search_fields = ['category', 'created_by__username']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Format Information', {
            'fields': ('category', 'format_file', 'created_by')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )