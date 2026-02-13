// src/components/Food/UserFoodPosts/FoodPostItem.tsx
import React, { useEffect, useState } from "react";
import {
  Clock,
  MapPin,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatGregorianToPersian } from "./utils/dateUtils";
import { getUserInfo } from "../../services/paymentService";

export interface FoodPostData {
  id: number;
  attributes: {
    name: string;
    price: string;
    location: string;
    date: string;
    day: string;
    mealType: string;
    isSoldOut: boolean;
  };
  author_info?: {
    username: string;
    first_name: string;
    last_name: string;
    student_id: string;
    bio?: string;
  };
  created_at: string;
}

interface FoodPostItemProps {
  post: FoodPostData;
  type: "purchased" | "sold";
}

const englishToPersianLocation: Record<string, string> = {
  yas: "یاس",
  dormitory_f: "خوابگاه خواهران",
  central_m: "مرکزی برادران",
  rashid: "رشید",
  hakimieh: "حکیمیه",
  seraj: "سراج",
  bagheri: "باقری",
  farjam: "فرجام",
  majidieh: "مجیدیه",
  basij: "بسیج",
};

const englishToPersianMeal: Record<string, string> = {
  lunch: "ناهار",
  dinner: "شام",
};

export function FoodPostItem({ post, type }: FoodPostItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [pass, setPass] = useState("");

  const formattedDate = formatGregorianToPersian(post.attributes.date);
  const persianLocation =
    englishToPersianLocation[post.attributes.location] ||
    post.attributes.location;
  const persianMeal =
    englishToPersianMeal[post.attributes.mealType] ||
    post.attributes.mealType;

  const formatPrice = (price: string) => {
    const num = parseInt(price);
    if (isNaN(num)) return price;
    return `${num.toLocaleString("fa-IR")} تومان`;
  };

  useEffect(() => {
    const loadPass = async () => {
      if (!post.author_info) return;
      const result = await getUserInfo(post.author_info.username);
      setPass(result?.info ?? "");
    };
    loadPass();
  }, [post.author_info]);

  const cardStyle = {
    backgroundColor: "var(--card-bg)",
    border: "1px solid var(--border-color)",
    boxShadow: "var(--shadow)",
    borderRadius: "1rem",
  };

  const subtleBg = {
    backgroundColor: "var(--background-light)",
  };

  return (
    <div style={cardStyle} className="overflow-hidden transition-all">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 text-right"
        style={{ color: "var(--text-primary)" }}
        aria-expanded={isExpanded}
      >
        <div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" style={{ color: "var(--text-light)" }} />
          ) : (
            <ChevronDown
              className="h-5 w-5"
              style={{ color: "var(--text-light)" }}
            />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">
              {post.attributes.name}
            </h3>

            {type === "purchased" && (
              <span
                className="rounded-full px-2 py-1 text-xs font-medium"
                style={{
                  backgroundColor: "var(--primary-light)",
                  color: "var(--primary-color)",
                }}
              >
                خریداری‌شده
              </span>
            )}

            {type === "sold" && (
              <span
                className="rounded-full px-2 py-1 text-xs font-medium"
                style={{
                  backgroundColor: "rgba(16,185,129,0.15)",
                  color: "var(--success-color)",
                }}
              >
                فروخته‌شده
              </span>
            )}
          </div>

          <div
            className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4"
            style={{ color: "var(--text-secondary)" }}
          >
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" style={{ color: "var(--text-light)" }} />
              <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                {formatPrice(post.attributes.price)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" style={{ color: "var(--text-light)" }} />
              <span>{persianLocation}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" style={{ color: "var(--text-light)" }} />
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" style={{ color: "var(--text-light)" }} />
              <span>{persianMeal}</span>
            </div>
          </div>
        </div>
      </button>

      {/* Purchased Details */}
      {isExpanded && type === "purchased" && post.author_info && (
        <div
          className="p-4 animate-[slideDown_.2s_ease-out]"
          style={{
            borderTop: "1px solid var(--border-color)",
            ...subtleBg,
          }}
        >
          <div className="space-y-4">
            <div
              className="grid grid-cols-1 gap-3 rounded-xl p-4 md:grid-cols-2"
              style={cardStyle}
            >
              <div>
                <div className="mb-1 text-xs" style={{ color: "var(--text-light)" }}>
                  شماره دانشجویی
                </div>
                <div
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {post.author_info.student_id}
                </div>
              </div>

              <div>
                <div className="mb-1 text-xs" style={{ color: "var(--text-light)" }}>
                  رمز دوم
                </div>
                <div
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {pass}
                </div>
              </div>
            </div>

            <div
              className="rounded-lg p-3"
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border-color)",
              }}
            >
              <div className="text-xs" style={{ color: "var(--text-light)" }}>
                زمان خرید
              </div>
              <div
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {new Date(post.created_at).toLocaleDateString("fa-IR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sold Placeholder */}
      {isExpanded && type === "sold" && (
        <div
          className="p-8 text-center animate-[slideDown_.2s_ease-out]"
          style={{
            borderTop: "1px solid var(--border-color)",
            backgroundColor: "var(--background-light)",
            color: "var(--text-light)",
          }}
        >
          <div className="mb-2">اطلاعات خریدار در آینده نمایش داده خواهد شد</div>
          <div className="text-xs">این بخش در حال توسعه است</div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
            max-height: 0;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            max-height: 500px;
          }
        }
      `}</style>
    </div>
  );
}
