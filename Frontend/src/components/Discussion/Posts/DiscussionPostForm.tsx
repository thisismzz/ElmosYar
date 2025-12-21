import React, { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import './DiscussionPostForm.css';
import { ChatPostData, ChatPostFormProps, FormErrors } from '../../../types/post.types';

const MAX_CONTENT_LENGTH = 5000;
const MAX_TAGS = 10;
const MIN_TAG_LENGTH = 2;

const ChatPostForm: React.FC<ChatPostFormProps> = ({ 
  onClose, 
  onSubmit, 
  initialData = {}, 
  category = 'discussion',
  isSubmitting: externalSubmitting = false,
  availableTags = []
}) => {

  const [content, setContent] = useState<string>(initialData.content || '');
  const [tags, setTags] = useState<string[]>(initialData.tags || []);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(externalSubmitting);
  const [charCount, setCharCount] = useState<number>(0);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showAvailableTags, setShowAvailableTags] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [debugAvailableTags] = useState<string[]>([
    'تست',
  ]);

  const actualAvailableTags = availableTags.length > 0 ? availableTags : debugAvailableTags;

  useEffect(() => {
    setCharCount(content.length);
  }, [content]);

  useEffect(() => {
    setIsSubmitting(externalSubmitting);
  }, [externalSubmitting]);

  useEffect(() => {
    // Focus on content after form appears
    const timer = setTimeout(() => {
      contentRef.current?.focus();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const addTag = (tag: string): void => {
    const tagToAdd = tag.toLowerCase();
    
    if (!tagToAdd || tagToAdd.length < MIN_TAG_LENGTH) {
      setErrors({
        ...errors,
        tags: `هشتگ باید حداقل ${MIN_TAG_LENGTH} حرف داشته باشد`
      });
      return;
    }
    
    if (!tags.includes(tagToAdd) && tags.length < MAX_TAGS) {
      setTags([...tags, tagToAdd]);
      setShowAvailableTags(false);
      if (errors.tags) {
        setErrors({ ...errors, tags: undefined });
      }
    }
  };

  const removeTag = (tagToRemove: string): void => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const text = e.target.value;
    if (text.length <= MAX_CONTENT_LENGTH) {
      setContent(text);
      if (errors.content) {
        setErrors({ ...errors, content: undefined });
      }
    }
  };

  const toggleAvailableTags = (): void => {
    setShowAvailableTags(!showAvailableTags);
  };

  const handleSelectTag = (tag: string): void => {
    addTag(tag);
  };

  const filteredAvailableTags = actualAvailableTags.filter(tag => {
    const tagLower = tag.toLowerCase();
    return !tags.includes(tagLower);
  });

  const handleClose = (): void => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };


  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!content.trim()) {
      setErrors({ content: 'محتوا نمی‌تواند خالی باشد' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const postData: ChatPostData = {
        content: content.trim(),
        tags: tags.map(tag => `#${tag}`),
        category: category as 'discussion' | 'food-exchange' | 'teacher-review',
        createdAt: new Date(),
        updatedAt: new Date(),
        title: ''
      };

      await onSubmit(postData);
      
      setContent('');
      setTags([]);
      setErrors({});
      setShowAvailableTags(false);
      
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'خطایی در ارسال پست رخ داد'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
    }
  }, [content]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowAvailableTags(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleBackdropClick = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (!isClosing) {
      document.addEventListener('mousedown', handleBackdropClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleBackdropClick);
    };
  }, [isClosing]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className={`chat-post-form-container ${isClosing ? 'closing' : ''}`}>
      <div ref={formRef} className={`chat-post-form ${isClosing ? 'slide-out' : 'slide-in'}`} dir="rtl">
        <form onSubmit={handleSubmit} className="post-form-content">
          {/* Header */}
          <div className="form-header">
            <h2 className="form-title">ایجاد پست جدید</h2>
            <button 
              type="button" 
              onClick={handleClose}
              className="close-button"
              aria-label="بستن فرم"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 5L15 15M5 15L15 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Content Input */}
          <div className="form-group">
            <label htmlFor="post-content" className="form-label">
              محتوای پست
            </label>
            <textarea
              ref={contentRef}
              id="post-content"
              value={content}
              onChange={handleContentChange}
              placeholder="متن پست خود را اینجا بنویسید..."
              className={`form-textarea ${errors.content ? 'input-error' : ''}`}
              disabled={isSubmitting}
              rows={4}
            />
            <div className="input-meta">
              <span className={`char-counter ${charCount > MAX_CONTENT_LENGTH * 0.9 ? 'warning' : ''}`}>
                {charCount}/{MAX_CONTENT_LENGTH}
              </span>
              {errors.content && (
                <span className="error-message">{errors.content}</span>
              )}
            </div>
          </div>

          {/* Tags Section */}
          <div className="form-group">
            <div className="tags-header">
              <label className="form-label">
                هشتگ‌ها (اختیاری)
              </label>
            </div>
            
            <div className="tags-input-container">
              {/* نمایش هشتگ‌های انتخاب شده */}
              {tags.length > 0 && (
                <div className="tags-display">
                  {tags.map((tag, index) => (
                    <span key={index} className="tag-item">
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="tag-remove"
                        disabled={isSubmitting}
                        aria-label={`حذف هشتگ ${tag}`}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              
              {/* دکمه افزودن هشتگ */}
              <div className="add-tag-button-container">
                <button
                  type="button"
                  onClick={toggleAvailableTags}
                  className="add-tag-button-simple"
                  disabled={isSubmitting || tags.length >= MAX_TAGS}
                  aria-label="افزودن هشتگ"
                  title="افزودن هشتگ"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M12 4V20M4 12H20" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="add-tag-text">افزودن هشتگ</span>
                </button>
              </div>

              {/* Dropdown هشتگ‌های موجود */}
              {showAvailableTags && (
                <div ref={dropdownRef} className="available-tags-dropdown">
                  <div className="available-tags-header">
                    <span className="available-tags-title">
                      هشتگ‌های موجود
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAvailableTags(false)}
                      className="close-dropdown-button"
                      aria-label="بستن لیست هشتگ‌ها"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  <div className="available-tags-list">
                    {filteredAvailableTags.length > 0 ? (
                      <>
                        <div className="available-tags-count">
                          {filteredAvailableTags.length} هشتگ پیدا شد
                        </div>
                        {filteredAvailableTags.slice(0, 20).map((tag, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSelectTag(tag)}
                            className="available-tag-item"
                            disabled={tags.includes(tag.toLowerCase())}
                          >
                            <span className="tag-text">#{tag}</span>
                            {tags.includes(tag.toLowerCase()) ? (
                              <span className="tag-selected">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                انتخاب شده
                              </span>
                            ) : (
                              <svg className="add-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 3V11M3 7H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="no-tags-found">
                        همه هشتگ‌ها انتخاب شده‌اند
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="input-meta">
              <span className="tag-counter">
                {tags.length}/{MAX_TAGS} هشتگ
                {tags.length > 0 && ` (حداقل ${MIN_TAG_LENGTH} حرف)`}
              </span>
              {errors.tags && (
                <span className="error-message">{errors.tags}</span>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="general-error">
              {errors.general}
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="cancel-button"
              disabled={isSubmitting}
            >
              انصراف
            </button>
            
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting || !content.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  در حال ارسال...
                </>
              ) : 'انتشار پست'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPostForm;