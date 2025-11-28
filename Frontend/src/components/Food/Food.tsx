import React from 'react';
import './Food.css';
import { FoodItem } from '../../types/food';

const Food: React.FC = () => {
  const foodItems: FoodItem[] = [
    {
      id: '1',
      name: 'سالاد سزار',
      mealType: 'ناهار',
      location: 'کافه دانشکده مدیریت',
      date: 'سه شنبه، ۲۳ آبان',
      price: 5.5,
      isSoldOut: true
    },
    {
      id: '2',
      name: 'پاستا الفردو',
      mealType: 'ناهار',
      location: 'سلف دانشکده مهندسی',
      date: 'سه شنبه، ۲۳ آبان',
      price: 9,
      isSoldOut: true
    },
    {
      id: '3',
      name: 'چلو خورشت قیمه',
      mealType: 'ناهار',
      location: 'سلف مرکزی',
      date: 'سه شنبه، ۲۳ آبان',
      price: 4.5,
      isSoldOut: false
    },
    {
      id: '4',
      name: 'چلوکباب کوبیده',
      mealType: 'شام',
      location: 'رستوران دانشکده فنی',
      date: 'سه شنبه، ۲۳ آبان',
      price: 12,
      isSoldOut: false
    }
  ];

  const handleBuyFood = (item: FoodItem) => {
    if (item.isSoldOut) {
      alert(`متاسفانه ${item.name} تمام شده است!`);
      return;
    }
    alert(`سفارش ${item.name} با موفقیت ثبت شد! مبلغ: $${item.price}`);
  };

  const formatPrice = (price: number): string => {
    return `$${price}`;
  };

  const getMealTypeIcon = (mealType: string): string => {
    switch (mealType) {
      case 'ناهار':
        return '🌞';
      case 'شام':
        return '🌙';
      default:
        return '🍽️';
    }
  };

  return (
    <div className="food-order-container">
      <div className="food-header">
        <h2 className="page-title">سفارش غذا</h2>
        <p className="page-subtitle">منوی امروز - انتخاب و سفارش آنلاین</p>
      </div>
      
      <div className="food-items-grid">
        {foodItems.map((item) => (
          <div key={item.id} className={`food-card ${item.isSoldOut ? 'sold-out' : ''}`}>
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
                  <span className="detail-icon">⏰</span>
                  <div className="detail-content">
                    <span className="detail-label">وعده غذایی</span>
                    <span className="detail-value">{item.mealType}</span>
                  </div>
                </div>
                
                <div className="detail-item">
                  <span className="detail-icon">📍</span>
                  <div className="detail-content">
                    <span className="detail-label">سلف</span>
                    <span className="detail-value">{item.location}</span>
                  </div>
                </div>
                
                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <div className="detail-content">
                    <span className="detail-label">تاریخ</span>
                    <span className="detail-value">{item.date}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-footer">
              {item.isSoldOut ? (
                <div className="sold-out-section">
                  <span className="sold-out-badge">تمام شده</span>
                  <span className="sold-out-text">این غذا فعلاً موجود نیست</span>
                </div>
              ) : (
                <button 
                  className="buy-button"
                  onClick={() => handleBuyFood(item)}
                >
                  <span className="button-text">خرید</span>
                </button>
              )}
            </div>
            
            {item.isSoldOut && (
              <div className="sold-out-overlay">
                <span>تمام شده</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Food;