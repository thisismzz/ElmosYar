import React, { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, CardBody, InlineError, Label, Textarea, cn, HelperText, Input } from "../../../components/UIOverrides";
import { createPost } from "../../../services/PostService";

const MAX_CONTENT_LENGTH = 5000;
const MAX_TAGS = 10;
const MIN_TAG_LENGTH = 2;

type FormErrors = { content?: string; tags?: string; general?: string };

export function CreateDiscussionPostForm(props: {
  availableTags?: string[];
  onSubmit?: (payload: {
    content: string;
    tags: string[]; // with "#"
    category: "discussion";
    createdAt: Date;
    updatedAt: Date;
    title: string;
  }) => Promise<void> | void;
}) {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showTags, setShowTags] = useState(false);

  const contentRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [tagQuery, setTagQuery] = useState("");

  const actualAvailableTags = useMemo(() => {
    const fallback = ["تست"];
    return (props.availableTags && props.availableTags.length > 0 ? props.availableTags : fallback).map((t) =>
      t.replace(/^#/, "").trim()
    );
  }, [props.availableTags]);

  useEffect(() => {
    contentRef.current?.focus();
  }, []);

  useEffect(() => {
    // autosize
    if (!contentRef.current) return;
    contentRef.current.style.height = "auto";
    contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
  }, [content]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowTags(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const addTag = (raw: string) => {
    const t = raw.replace(/^#/, "").trim().toLowerCase();
    if (!t || t.length < MIN_TAG_LENGTH) {
      setErrors((p) => ({ ...p, tags: `هشتگ باید حداقل ${MIN_TAG_LENGTH} حرف داشته باشد` }));
      return;
    }
    if (tags.includes(t)) return;
    if (tags.length >= MAX_TAGS) {
      setErrors((p) => ({ ...p, tags: `حداکثر ${MAX_TAGS} هشتگ مجاز است` }));
      return;
    }
    setTags((p) => [...p, t]);
    setErrors((p) => ({ ...p, tags: undefined }));
    setTagQuery("");
    setShowTags(false);
  };

  const removeTag = (t: string) => setTags((p) => p.filter((x) => x !== t));

  const filtered = useMemo(() => {
    const q = tagQuery.trim().toLowerCase();
    return actualAvailableTags
      .filter((t) => !tags.includes(t.toLowerCase()))
      .filter((t) => (q ? t.toLowerCase().includes(q) : true))
      .slice(0, 24);
  }, [actualAvailableTags, tags, tagQuery]);

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    if (v.length <= MAX_CONTENT_LENGTH) {
      setContent(v);
      setErrors((p) => ({ ...p, content: undefined, general: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrors({ content: "محتوا نمی‌تواند خالی باشد" });
      return;
    }

    try {
      setSubmitting(true);
      setErrors({});

      const payload = {
        content: content.trim(),
        tags: tags.map((t) => `#${t}`),
        category: "discussion" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        title: "",
      };

      await props.onSubmit?.(payload);

      setContent("");
      setTags([]);
      setTagQuery("");
      setShowTags(false);
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : "خطایی در ارسال پست رخ داد" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="discussion-content">
			محتوای پست
			<div className="mt-2 inline items-center justify-between gap-3 pr-2">
          <span
            className={cn(
              "text-xs",
              content.length > MAX_CONTENT_LENGTH * 0.9 ? "text-amber-300" : "text-neutral-500"
            )}
          >
            {content.length}/{MAX_CONTENT_LENGTH}
          </span>
          <InlineError>{errors.content}</InlineError>
        </div>
		</Label>
		
        <Textarea
          ref={contentRef}
          id="discussion-content"
          value={content}
          onChange={handleContentChange}
          placeholder="متن پست خود را اینجا بنویسید..."
          disabled={isSubmitting}
          className={cn(errors.content && "border-red-900/60 focus:border-red-900/60 focus:ring-red-900/30")}
          rows={4}
        />
        
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-begin gap-3">
          <Label className="mb-0">هشتگ‌ها (اختیاری)</Label>
          <span className="text-xs text-neutral-500">
            {tags.length}/{MAX_TAGS}
          </span>
        </div>

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-2 rounded-full border border-blue-400 bg-[#16519F] px-3 py-1 text-sm text-neutral-200"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  disabled={isSubmitting}
                  className="rounded-full p-1 text-neutral-400 hover:text-neutral-100"
                  aria-label={`حذف هشتگ ${t}`}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M9 3L3 9M3 3L9 9"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        ) : (
        //   <HelperText>اگر لازم است، هشتگ انتخاب کنید تا پست راحت‌تر پیدا شود.</HelperText>
		""
        )}

        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowTags((p) => !p)}
              disabled={isSubmitting || tags.length >= MAX_TAGS}
              className="h-11"
            >
              افزودن هشتگ
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 4V20M4 12H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>

            <div className="min-w-0 flex-1">
              <Input
                value={tagQuery}
                onChange={(e) => { setShowTags(tagQuery.length > 0); setTagQuery(e.target.value);}}
                placeholder="جستجوی هشتگ..."
                disabled={isSubmitting}
              />
            </div>
			

            <Button
              type="button"
              variant="primary"
              className="h-11"
              onClick={() => addTag(tagQuery)}
              disabled={isSubmitting || !tagQuery.trim()}
            >
              اضافه
            </Button>
          </div>
		  {showTags ? (
            <div className="z-20 mt-2 w-full overflow-hidden rounded-2xl border align-bottom border-neutral-200 bg-white shadow-xl">
              <div className="flex items-center justify-between  px-4 py-3">
                <span className="text-sm font-semibold text-neutral-900">هشتگ‌های موجود</span>
                <button
                  type="button"
                  className="rounded-lg p-1 text-neutral-400 hover:text-neutral-100"
                  onClick={() => setShowTags(false)}
                  aria-label="بستن"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="max-h-72 overflow-auto p-2">
                {filtered.length > 0 ? (
                  <div className="grid grid-cols-1 gap-1">
                    {filtered.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => addTag(t)}
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-right text-sm text-neutral-900 hover:bg-neutral-400"
                        disabled={isSubmitting}
                      >
                        <span className="font-medium">#{t}</span>
                        <span className="text-xs text-neutral-500">افزودن</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-6 text-center text-sm text-neutral-500">
                    موردی یافت نشد
                  </div>
                )}
              </div>
            </div>
          ) : null}

          <InlineError>{errors.tags}</InlineError>

          
        </div>
      </div>

      <InlineError>{errors.general}</InlineError>

      <div className="flex items-center justify-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="h-11"
          onClick={() => {createPost('discussion', {
            body: content,
            tags: tags.join(','),
          });
		      console.log(content)}}
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
              در حال ارسال...
            </>
          ) : (
            "انتشار پست"
          )}
        </Button>
      </div>
    </form>
  );
}
