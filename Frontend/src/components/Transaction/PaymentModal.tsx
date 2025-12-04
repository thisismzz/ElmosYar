import React, { useState } from 'react';
import './PaymentModal.css';
import { PaymentModalProps, PaymentMethod, FoodItem } from '../../types/payment';

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  foodItem,
  walletBalance
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('fa-IR').format(num);
  };

  const afterPaymentBalance = walletBalance - foodItem.price;
  const hasSufficientBalance = afterPaymentBalance >= 0;

  const handlePayment = async () => {
    if (!selectedMethod) return;
    
    if (selectedMethod === 'wallet' && !hasSufficientBalance) {
      alert('موجودی کیف پول شما کافی نیست. لطفا روش دیگری انتخاب کنید.');
      return;
    }

    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (selectedMethod === 'wallet') {
        alert(`پرداخت با ولت انجام شد. مبلغ ${formatNumber(foodItem.price)} تومان کسر شد.`);
      } else {
        alert('به صفحه پرداخت آنلاین منتقل می‌شوید...');
      }
      
      if (onPaymentSuccess) {
        onPaymentSuccess(selectedMethod, foodItem);
      }
      
      onClose();
    } catch (error) {
      console.error('Payment failed:', error);
      alert('پرداخت با خطا مواجه شد. لطفا مجددا تلاش کنید.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        {/* هدر مودال */}
        <div className="modal-header">
          <h2 className="modal-title">پرداخت هزینه غذا</h2>
          <p className="modal-subtitle">لطفاً روش پرداخت را انتخاب کنید</p>
          <button className="close-button" onClick={onClose} aria-label="بستن">
            ×
          </button>
        </div>

        {/* اطلاعات غذا */}
        <div className="food-info-section">
          <div className="food-name-display">{foodItem.name}</div>
          <div className="food-details-grid">
            <div className="food-detail">
              <span className="detail-label">نوع وعده:</span>
              <span className="detail-value">{foodItem.mealType}</span>
            </div>
            <div className="food-detail">
              <span className="detail-label">مکان:</span>
              <span className="detail-value">{foodItem.location}</span>
            </div>
            <div className="food-detail">
              <span className="detail-label">قیمت:</span>
              <span className="detail-value price">{formatNumber(foodItem.price)} تومان</span>
            </div>
            <div className="food-detail">
              <span className="detail-label">کد غذا:</span>
              <span className="detail-value food-id">#{foodItem.id}</span>
            </div>
          </div>
        </div>

        {/* گزینه‌های پرداخت */}
        <div className="payment-options">
          {/* گزینه ۱: ولت */}
          <div 
            className={`payment-option ${selectedMethod === 'wallet' ? 'selected' : ''} ${
              !hasSufficientBalance ? 'insufficient' : ''
            }`}
            onClick={() => setSelectedMethod('wallet')}
          >
            <div className="option-content">
              <h3 className="option-title">استفاده از ولت</h3>
              
              <div className="wallet-details">
                <div className="detail-row">
                  <span>موجودی ولت:</span>
                  <span className="amount">{formatNumber(walletBalance)}</span>
                </div>
                <div className="detail-row">
                  <span>هزینه غذا:</span>
                  <span className="amount negative">{formatNumber(foodItem.price)}</span>
                </div>
                <div className="detail-row">
                  <span>موجودی پس از پرداخت:</span>
                  <span className={`amount ${!hasSufficientBalance ? 'insufficient' : 'positive'}`}>
                    {formatNumber(afterPaymentBalance)}
                  </span>
                </div>
                
                {!hasSufficientBalance && (
                  <div className="insufficient-warning">
                    ⚠️ موجودی کیف پول کافی نیست
                  </div>
                )}
              </div>
            </div>
            
            <div className="option-selector">
              <div className={`radio-button ${selectedMethod === 'wallet' ? 'checked' : ''}`}>
                {selectedMethod === 'wallet' && <div className="radio-inner" />}
              </div>
            </div>
          </div>

          {/* گزینه ۲: آنلاین */}
          <div 
            className={`payment-option ${selectedMethod === 'online' ? 'selected' : ''}`}
            onClick={() => setSelectedMethod('online')}
          >
            <div className="option-content">
              <h3 className="option-title">پرداخت آنلاین</h3>
              
              <div className="online-details">
                <div className="detail-row">
                  <span>هزینه غذا:</span>
                  <span className="amount">{formatNumber(foodItem.price)} تومان</span>
                </div>
              </div>
            </div>
            
            <div className="option-selector">
              <div className={`radio-button ${selectedMethod === 'online' ? 'checked' : ''}`}>
                {selectedMethod === 'online' && <div className="radio-inner" />}
              </div>
            </div>
          </div>
        </div>

        {/* دکمه پرداخت */}
        <div className="payment-action">
          <button
            className={`pay-button ${!selectedMethod || isProcessing ? 'disabled' : ''}`}
            onClick={handlePayment}
            disabled={!selectedMethod || isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="spinner"></span>
                در حال پردازش...
              </>
            ) : selectedMethod === 'wallet' ? (
              'پرداخت با ولت'
            ) : (
              'رفتن به صفحه پرداخت آنلاین'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;