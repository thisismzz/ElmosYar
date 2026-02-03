// src/components/Food/UserFoodPosts/FoodPostItem.tsx
import React, { useEffect, useState } from "react";
import { 
  Clock, 
  MapPin, 
  Calendar, 
  DollarSign,
  ChevronDown,
  ChevronUp,
  User,
  IdCard 
} from "lucide-react";
import { formatGregorianToPersian } from "./utils/dateUtils";

import { getUserInfo } from "../../services/paymentService";

export interface FoodPostData {
  id: number;
  attributes: {
    name: string;
    price: string;
    location: string;
    date: string; // Gregorian with Persian digits like "۲۰۲۶-۰۲-۰۳"
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
  "yas": "یاس",
  "dormitory_f": "خوابگاه خواهران",
  "central_m": "مرکزی برادران",
  "rashid": "رشید",
  "hakimieh": "حکیمیه",
  "seraj": "سراج",
  "bagheri": "باقری",
  "farjam": "فرجام",
  "majidieh": "مجیدیه",
  "basij": "بسیج",
};

const englishToPersianMeal: Record<string, string> = {
  "lunch": "ناهار",
  "dinner": "شام",
};

export function FoodPostItem({ post, type }: FoodPostItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [pass, setPass] = useState("");

  // Format date
  const formattedDate = formatGregorianToPersian(post.attributes.date);
  
  // Get Persian location and meal
  const persianLocation = englishToPersianLocation[post.attributes.location] || post.attributes.location;
  const persianMeal = englishToPersianMeal[post.attributes.mealType] || post.attributes.mealType;

  // Format price with Persian digits and commas
  const formatPrice = (price: string) => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const num = parseInt(price);
    if (isNaN(num)) return price;
    
    const formatted = num.toLocaleString('fa-IR');
    return `${formatted} تومان`;
  };

  useEffect(() => {
    const updatePass = async () => {
        const result = post.author_info ? await getUserInfo(post.author_info?.username) : null
        
        setPass(result.info ?? "");
    };

    updatePass();
  })
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 text-right transition-colors hover:bg-neutral-50/50"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-neutral-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-neutral-400" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-neutral-900">
              {post.attributes.name}
            </h3>
            {type === "purchased" && (
              <span className="rounded-full bg-[#16519F]/10 px-2 py-1 text-xs font-medium text-[#16519F]">
                خریداری‌شده
              </span>
            )}
            {type === "sold" && (
              <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700">
                فروخته‌شده
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm text-neutral-600 sm:grid-cols-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-neutral-400" />
              <span className="font-medium text-neutral-900">
                {formatPrice(post.attributes.price)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-neutral-400" />
              <span>{persianLocation}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-neutral-400" />
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-neutral-400" />
              <span>{persianMeal}</span>
            </div>
          </div>
        </div>
      </button>

      {isExpanded && type === "purchased" && post.author_info && (
        <div className="border-t border-neutral-100 bg-neutral-50/50 p-4 animate-[slideDown_.2s_ease-out]">
          <div className="space-y-4">
            

            
            <div className="grid grid-cols-1 gap-3 rounded-xl bg-white p-4 shadow-sm md:grid-cols-2">

                {/* <div className="mb-1 flex items-center gap-1 text-xs text-neutral-500">
                  
                  <span>فروشنده:</span>
                </div>
                <div className="flex gap-2">
                  <p className="font-medium text-neutral-900"> {post.author_info.first_name} {post.author_info.last_name} </p>
                  <p className="font-medium text-neutral-400">  {post.author_info.username}@ </p>
                  
                </div>
              </div>  */}
              <div>
                <div className="mb-1 text-xs text-neutral-500">شماره دانشجویی</div>
                <div className="font-medium text-neutral-900">
                  {post.author_info.student_id}
                </div>
              </div>

              <div>
                <div className="mb-1 text-xs text-neutral-500">رمز دوم</div>
                <div className="font-medium text-neutral-900">
                  {pass}
                </div>
              </div>

              
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-3">
              <div className="text-xs text-neutral-500">زمان خرید</div>
              <div className="text-sm font-medium text-neutral-900">
                {new Date(post.created_at).toLocaleDateString('fa-IR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {isExpanded && type === "sold" && (
        <div className="border-t border-neutral-100 bg-neutral-50/50 p-4 animate-[slideDown_.2s_ease-out]">
          <div className="text-center text-neutral-500 py-8">
            <div className="mb-2">اطلاعات خریدار در آینده نمایش داده خواهد شد</div>
            <div className="text-xs">این بخش در حال توسعه است</div>
          </div>
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