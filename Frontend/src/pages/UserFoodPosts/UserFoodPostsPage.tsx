// src/components/Food/UserFoodPosts/UserFoodPostsPage.tsx
import React, { useState } from "react";
import { PageShell, Card, CardBody, SegmentedControl } from  "../../components/UIOverrides";
import { PurchasedFoodPosts } from "./PurchasedFoodPosts";
import { SoldFoodPosts } from "./SoldFoodPosts";

type FoodPostsTab = "purchased" | "sold";

export function UserFoodPostsPage() {
  const [activeTab, setActiveTab] = useState<FoodPostsTab>("purchased");

  return (
    <PageShell title="">
      <div className="space-y-6" dir="rtl">
        {/* Tab Selection */}
        {/* <Card className="overflow-hidden border border-neutral-200 bg-white shadow-sm">
          <CardBody>
            <SegmentedControl<FoodPostsTab>
              value={activeTab}
              onChange={setActiveTab}
              options={[
                { value: "purchased", label: "خریداری‌شده" },
                { value: "sold", label: "فروخته‌شده" },
              ]}
            />
          </CardBody>
        </Card> */}

        {/* Content Area */}
        <div className="animate-[fadeIn_.18s_ease-out]">
          {activeTab === "purchased" && <PurchasedFoodPosts />}
          {activeTab === "sold" && <SoldFoodPosts />}
        </div>
      </div>

      {/* Animation keyframe */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </PageShell>
  );
}