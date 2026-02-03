// src/components/Food/UserFoodPosts/SoldFoodPosts.tsx
import React, { useEffect, useState } from "react";
import { Card, CardBody, InlineError, LoadingSpinner } from "../../components/UIOverrides" 
import { getSoldPosts } from "../../services/paymentService"; 
import { FoodPostItem, FoodPostData } from "./FoodPostItem";

export function SoldFoodPosts() {
  const [posts, setPosts] = useState<FoodPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSoldPosts();
  }, []);

  const fetchSoldPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getSoldPosts();
      
      if (!response.data.error) {
        setPosts(response.data.data || []);
      } else {
        // Handle specific error for not implemented
        if (response.data.code === "USER_TRANSACTION_NOT_EXIST") {
          setPosts([]); // Empty array instead of error
        } else {
          setError(response.data.message || "خطا در دریافت پست‌های فروخته‌شده");
        }
      }
    } catch (err: any) {
      setError(err.message || "خطا در ارتباط با سرور");
      console.error("Error fetching sold posts:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="overflow-hidden border border-neutral-200 bg-white">
        <CardBody className="py-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <LoadingSpinner size="lg" />
            <div className="text-sm text-neutral-500">در حال بارگذاری پست‌های فروخته‌شده...</div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="overflow-hidden border border-neutral-200 bg-white">
        <CardBody>
          <InlineError>{error}</InlineError>
          <div className="mt-4 flex justify-center">
            <button
              onClick={fetchSoldPosts}
              className="rounded-lg bg-[#16519F] px-4 py-2 text-sm font-medium text-white hover:bg-[#16519F]/90"
            >
              تلاش مجدد
            </button>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="overflow-hidden border border-neutral-200 bg-white">
        <CardBody className="py-12">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-neutral-100 p-4">
              <svg
                className="h-full w-full text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-neutral-900">
              هنوز فروشی نداشته‌اید
            </h3>
            <p className="text-sm text-neutral-500">
              پست‌های غذایی که می‌فروشید در اینجا نمایش داده می‌شوند.
            </p>
            <div className="mt-4 text-xs text-neutral-400">
              این بخش در حال توسعه است
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border border-neutral-200 bg-white shadow-sm">
      <CardBody>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              پست‌های فروخته‌شده
            </h3>
            <p className="text-sm text-neutral-500">
              {posts.length} پست فروخته‌شده
            </p>
          </div>
          <button
            onClick={fetchSoldPosts}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#16519F] hover:bg-[#16519F]/5"
          >
            بروزرسانی
          </button>
        </div>

        <div className="space-y-3">
          {posts.map((post) => (
            <FoodPostItem
              key={post.id}
              post={post}
              type="sold"
            />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}