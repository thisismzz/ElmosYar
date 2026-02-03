import React, { useEffect, useState } from 'react';
import { FoodItem } from "../../../types/food_posts";
import { Sun, Moon, Plus } from 'lucide-react';
import PaymentModal from '../../Transaction/PaymentModal';
import './FoodPostFeed.css';

interface FoodPostCardProps {
  item: FoodItem;
  onBuy: (item: FoodItem) => void;
}

export const FoodPostCard: React.FC<FoodPostCardProps> = ({ item, onBuy }) => {
  const formatPrice = (price: number): string => {
    return `${price} تومان`;
  };

  const isSoldOut = item.isSoldOut === true || item.isSoldOut === "true";

  return (
    <div key={item.id} className={`food-card ${isSoldOut ? 'sold-out' : ''}`}>
      <div className="card-header">
        <div className="meal-type-section">
          <h3 className="food-name">{item.name}</h3>
        </div>
        <div className="price-section">
          <span className="food-price">{formatPrice(item.price)}</span>
        </div>
      </div>

      <div className="card-body">
        <div className="food-details">
          <div className="detail-item">
            <div className="detail-content">
              <span className="detail-label">وعده غذایی</span>
              <span className="detail-value">{item.mealType}</span>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-content">
              <span className="detail-label">سلف</span>
              <span className="detail-value">{item.location}</span>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-content">
              <span className="detail-label">تاریخ</span>
              <span className="detail-value">{item.date}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-footer">
        {isSoldOut ? (
          <div className="sold-out-section">
            <span className="sold-out-badge">تمام شده</span>
            <span className="sold-out-text">این غذا فعلاً موجود نیست</span>
          </div>
        ) : (
          <button
            className="buy-button"
            onClick={() => onBuy(item)}
          >
            <span className="button-text">خرید</span>
          </button>
        )}
      </div>

      {isSoldOut && (
        <div className="sold-out-overlay">
          <span>تمام شده</span>
        </div>
      )}
    </div>
  );
};

interface FoodPostFeedProps {
  items: FoodItem[];
  isLoading?: boolean;
}

export const FoodPostFeed: React.FC<FoodPostFeedProps> = ({ items: initialItems, isLoading = false }) => {
  const [items, setItems] = useState<FoodItem[]>(initialItems || []);
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleBuyFood = (item: FoodItem) => {
    if (item.isSoldOut === true || item.isSoldOut === "true") {
      alert(`متاسفانه ${item.name} تمام شده است!`);
      return;
    }

    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handlePaymentSuccess = (_method: any, foodItem: FoodItem) => {
    setItems(prev => prev.map(i => i.id === foodItem.id ? { ...i, isSoldOut: "true" } : i));
  };

  if (isLoading) {
    return (
      <div className="food-order-container loading-container">
        {/* اسکلت هدر */}
        <div className="skeleton-header">
          <div className="skeleton-title"></div>
          <div className="skeleton-subtitle"></div>
        </div>

        {/* اسکلت گرید غذاها */}
        <div className="skeleton-food-grid">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="skeleton-food-card">
              {/* هدر کارت */}
              <div className="skeleton-card-header">
                <div className="skeleton-meal-type">
                  <div className="skeleton-icon"></div>
                  <div className="skeleton-text small"></div>
                </div>
                <div className="skeleton-price">
                  <div className="skeleton-text medium"></div>
                </div>
              </div>

              {/* بدنه کارت */}
              <div className="skeleton-card-body">
                <div className="skeleton-food-name">
                  <div className="skeleton-text large"></div>
                  <div className="skeleton-text large half"></div>
                </div>

                {/* جزئیات */}
                <div className="skeleton-details">
                  <div className="skeleton-detail-item">
                    <div className="skeleton-icon small"></div>
                    <div className="skeleton-detail-content">
                      <div className="skeleton-text xsmall"></div>
                      <div className="skeleton-text small"></div>
                    </div>
                  </div>
                  <div className="skeleton-detail-item">
                    <div className="skeleton-icon small"></div>
                    <div className="skeleton-detail-content">
                      <div className="skeleton-text xsmall"></div>
                      <div className="skeleton-text small"></div>
                    </div>
                  </div>
                  <div className="skeleton-detail-item">
                    <div className="skeleton-icon small"></div>
                    <div className="skeleton-detail-content">
                      <div className="skeleton-text xsmall"></div>
                      <div className="skeleton-text small"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* فوتر کارت */}
              <div className="skeleton-card-footer">
                <div className="skeleton-buy-button"></div>
              </div>
            </div>
          ))}
        </div>

        {/* انیمیشن لودینگ */}
        <div className="food-loading-overlay">
          <div className="food-loading-spinner">
            <div className="spinner-circle"></div>
            <div className="spinner-circle"></div>
            <div className="spinner-circle"></div>
            <div className="spinner-circle"></div>
          </div>
          <div className="loading-text">در حال بارگذاری منوی غذا...</div>
          <div className="loading-subtext">لطفاً چند لحظه صبر کنید</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`food-order-container ${items.length === 1 ? 'single-item' : 'double-item'}`}>
      {items.length === 0 ? (
        <div className="food-empty-state">
          <div className="empty-state-icon">🍽️</div>
          <h3>هیچ غذایی موجود نیست</h3>
          <p>برای شروع، غذای جدیدی اضافه کنید</p>
          <button
            className="empty-state-button"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={20} />
            <span>اضافه کردن غذا</span>
          </button>
        </div>
      ) : (
        <>
          <div className={`food-items-grid ${items.length === 1 ? 'single-item-grid' : 'double-item-grid'}`}>
            {items.map((item) => (
              <FoodPostCard key={item.id} item={item} onBuy={handleBuyFood} />
            ))}
          </div>
        </>
      )}

      {selectedItem && (
        <PaymentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onPaymentSuccess={handlePaymentSuccess}
          foodItem={selectedItem}
        />
      )}
    </div>
  );
};