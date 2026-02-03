// src/components/Food/UserFoodPosts/PurchasedFoodPosts.tsx
import React, { useEffect, useState } from "react";
import { Card, CardBody, InlineError, LoadingSpinner } from  "../../components/UIOverrides";
import { getPurchasedPosts } from "../../services/paymentService"; 
import { FoodPostItem, FoodPostData } from "./FoodPostItem";

export function PurchasedFoodPosts() {
  const [posts, setPosts] = useState<FoodPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPurchasedPosts();
  }, []);

  const fetchPurchasedPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getPurchasedPosts();
      
      if (!response.data.error) {
        setPosts(response.data.data || []);
      } else {
        setError(response.data.message || "خطا در دریافت پست‌های خریداری‌شده");
      }
    } catch (err: any) {
      setError(err.message || "خطا در ارتباط با سرور");
      console.error("Error fetching purchased posts:", err);
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
            <div className="text-sm text-neutral-500">در حال بارگذاری پست‌های خریداری‌شده...</div>
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
              onClick={fetchPurchasedPosts}
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-neutral-900">
              هنوز خریدی انجام نداده‌اید
            </h3>
            <p className="text-sm text-neutral-500">
              پس از خرید پست‌های غذایی، آن‌ها در اینجا نمایش داده می‌شوند.
            </p>
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
              پست‌های خریداری‌شده
            </h3>
            <p className="text-sm text-neutral-500">
              {posts.length} پست خریداری‌شده
            </p>
          </div>
          <button
            onClick={fetchPurchasedPosts}
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
              type="purchased"
            />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}