// src/components/Food/UserFoodPosts/SoldFoodPosts.tsx
import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  InlineError,
  LoadingSpinner,
} from "../../components/UIOverrides";
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
      } else if (response.data.code === "USER_TRANSACTION_NOT_EXIST") {
        // Not an error → just empty state
        setPosts([]);
      } else {
        setError(
          response.data.message || "خطا در دریافت پست‌های فروخته‌شده"
        );
      }
    } catch (err: any) {
      console.error("Error fetching sold posts:", err);
      setError(err.message || "خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Loading ---------------- */
  if (loading) {
    return (
      <Card>
        <CardBody className="py-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <LoadingSpinner size="lg" />
            <div
              className="text-sm"
              style={{ color: "var(--text-light)" }}
            >
              در حال بارگذاری پست‌های فروخته‌شده...
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  /* ---------------- Error ---------------- */
  if (error) {
    return (
      <Card>
        <CardBody>
          <InlineError>{error}</InlineError>

          <div className="mt-4 flex justify-center">
            <button
              onClick={fetchSoldPosts}
              className="rounded-lg px-4 py-2 text-sm font-medium transition"
              style={{
                backgroundColor: "var(--primary-color)",
                color: "#fff",
              }}
            >
              تلاش مجدد
            </button>
          </div>
        </CardBody>
      </Card>
    );
  }

  /* ---------------- Empty State ---------------- */
  if (posts.length === 0) {
    return (
      <Card>
        <CardBody className="py-12">
          <div className="text-center">
            <div
              className="mx-auto mb-4 h-16 w-16 rounded-full p-4 flex items-center justify-center"
              style={{ backgroundColor: "var(--background-light)" }}
            >
              <svg
                className="h-full w-full"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: "var(--text-light)" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h3
              className="mb-2 text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              هنوز فروشی نداشته‌اید
            </h3>

            <p
              className="text-sm"
              style={{ color: "var(--text-light)" }}
            >
              پست‌های غذایی که می‌فروشید در اینجا نمایش داده می‌شوند.
            </p>

            <div
              className="mt-4 text-xs"
              style={{ color: "var(--text-light)" }}
            >
              این بخش در حال توسعه است
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  /* ---------------- Content ---------------- */
  return (
    <Card>
      <CardBody>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              پست‌های فروخته‌شده
            </h3>
            <p
              className="text-sm"
              style={{ color: "var(--text-light)" }}
            >
              {posts.length} پست فروخته‌شده
            </p>
          </div>

          <button
            onClick={fetchSoldPosts}
            className="rounded-lg px-3 py-1.5 text-sm font-medium transition"
            style={{ color: "var(--primary-color)" }}
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
