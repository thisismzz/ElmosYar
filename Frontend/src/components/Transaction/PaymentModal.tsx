import React, { useState } from 'react';
import './PaymentModal.css';

type PaymentMethod = 'wallet' | 'online';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodCost: number;
  walletBalance: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  foodCost,
  walletBalance
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('fa-IR').format(num);
  };

  const afterPaymentBalance = walletBalance - foodCost;

  const handlePayment = () => {
    if (!selectedMethod) return;
    
    if (selectedMethod === 'wallet') {
      alert(`پرداخت با کیف پول انجام شد. مبلغ ${formatNumber(foodCost)} تومان کسر شد.`);
    } else {
      alert('به صفحه پرداخت آنلاین منتقل می‌شوید...');
    }
    
    onClose();
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

        {/* گزینه‌های پرداخت */}
        <div className="payment-options">
          {/* گزینه ۱: ولت */}
          <div 
            className={`payment-option ${selectedMethod === 'wallet' ? 'selected' : ''}`}
            onClick={() => setSelectedMethod('wallet')}
          >
            <div className="option-content">
              <h3 className="option-title">استفاده از کیف پول</h3>
              
              <div className="wallet-details">
                <div className="detail-row">
                  <span>موجودی کیف پول:</span>
                  <span className="amount">{formatNumber(walletBalance)}</span>
                </div>
                <div className="detail-row">
                  <span>هزینه غذا:</span>
                  <span className="amount negative">{formatNumber(foodCost)}</span>
                </div>
                <div className="detail-row">
                  <span>موجودی پس از پرداخت:</span>
                  <span className="amount positive">{formatNumber(afterPaymentBalance)}</span>
                </div>
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
                  <span className="amount">{formatNumber(foodCost)} تومان</span>
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
            className={`pay-button ${!selectedMethod ? 'disabled' : ''}`}
            onClick={handlePayment}
            disabled={!selectedMethod}
          >
            {selectedMethod === 'wallet' ? 'پرداخت با کیف پول' : 'رفتن به صفحه پرداخت آنلاین'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;