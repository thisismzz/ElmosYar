// src/components/Food/UserFoodPosts/UserFoodPostsPage.tsx
import React, { useState } from "react";
import { PageShell } from "../../components/UIOverrides";
import { PurchasedFoodPosts } from "./PurchasedFoodPosts";
import { SoldFoodPosts } from "./SoldFoodPosts";

type FoodPostsTab = "purchased" | "sold";

export function UserFoodPostsPage() {
  const [activeTab] = useState<FoodPostsTab>("purchased");

  return (
    <PageShell title="">
      <div className="space-y-6" dir="rtl">
        {/* Content */}
        <div className="animate-[fadeIn_.18s_ease-out]">
          {activeTab === "purchased" && <PurchasedFoodPosts />}
          {activeTab === "sold" && <SoldFoodPosts />}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </PageShell>
  );
}
