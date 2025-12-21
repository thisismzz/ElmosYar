import React, { useEffect, useState } from 'react';
import './PaymentModal.css';
import { PaymentModalProps, PaymentMethod, FoodItem } from '../../types/food_posts';
import { getWalletData, depositToWallet, withdrawFromWallet, walletPurchase } from '../../services/paymentService';

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  foodItem,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [studentCredentials, setStudentCredentials] = useState({
    studentId: '402442441',
    password: '1234'
  });

  const getWalletBalance = async () => {
    const result = await getWalletData();
    console.log(result)
    return result.balance;
  }

  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const response = await getWalletBalance();
        console.log(response.data)
        setWalletBalance(response);
      } catch (err) {
        console.error(err);
      }
    }
    fetchWalletBalance();
  }, [])

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('fa-IR').format(num);
  };

  const afterPaymentBalance = walletBalance - foodItem.price;
  const hasSufficientBalance = afterPaymentBalance >= 0;

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('کپی شد!');
      })
      .catch(err => {
        console.error('خطا در کپی کردن:', err);
      });
  };

  const handlePayment = async () => {
    if (!selectedMethod) return;

    if (selectedMethod === 'wallet' && !hasSufficientBalance) {
      alert('موجودی کیف پول شما کافی نیست. لطفا روش دیگری انتخاب کنید.');
      return;
    }

    setIsProcessing(true);

    try {
      if (selectedMethod === 'wallet') {
        const purchaseResult = await walletPurchase(foodItem.id);
        if (purchaseResult.successful) {
          // نمایش صفحه موفقیت آمیز
          setShowSuccessScreen(true);
          if (onPaymentSuccess) {
            onPaymentSuccess(selectedMethod, foodItem);
          }
        } else {
          alert(purchaseResult.message);
          setIsProcessing(false);
        }
      } else {
        alert('به صفحه پرداخت آنلاین منتقل می‌شوید...'); //TODO
        onClose();
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert('پرداخت با خطا مواجه شد. لطفا مجددا تلاش کنید.');
      setIsProcessing(false);
    }
  };

  const handleCloseSuccessScreen = () => {
    setShowSuccessScreen(false);
    onClose();
  };

  if (!isOpen) return null;

  // صفحه نمایش اطلاعات بعد از پرداخت موفق
  if (showSuccessScreen) {
    return (
      <div className="payment-modal-overlay" onClick={handleCloseSuccessScreen}>
        <div className="payment-modal success-modal" onClick={(e) => e.stopPropagation()}>
          {/* هدر مودال */}
          <div className="modal-header success-header">
            <div className="success-icon">✓</div>
            <h2 className="modal-title">پرداخت موفق</h2>
            <p className="modal-subtitle">خرید شما با موفقیت ثبت شد</p>
          </div>

          {/* اطلاعات خرید */}
          <div className="success-content">
            <div className="purchase-info">
              <div className="info-item">
                <span className="info-label">نام غذا:</span>
                <span className="info-value">{foodItem.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">مبلغ پرداختی:</span>
                <span className="info-value price">{formatNumber(foodItem.price)} تومان</span>
              </div>
              <div className="info-item">
                <span className="info-label">موجودی جدید:</span>
                <span className="info-value">{formatNumber(afterPaymentBalance)} تومان</span>
              </div>
              <div className="info-item">
                <span className="info-label">زمان خرید:</span>
                <span className="info-value">{new Date().toLocaleString('fa-IR')}</span>
              </div>
            </div>

            {/* اطلاعات دسترسی */}
            <div className="credentials-section">
              <h3 className="credentials-title">اطلاعات دسترسی به غذا</h3>
              <p className="credentials-description">
                لطفاً اطلاعات زیر را به مسئول سالن غذا ارائه دهید:
              </p>

              <div className="credential-item">
                <div className="credential-header">
                  <span className="credential-label">شماره دانشجویی:</span>
                  <button 
                    className="copy-button"
                    onClick={() => handleCopyToClipboard(studentCredentials.studentId)}
                  >
                    کپی
                  </button>
                </div>
                <div 
                  className="credential-value copyable"
                  onClick={() => handleCopyToClipboard(studentCredentials.studentId)}
                >
                  {studentCredentials.studentId}
                </div>
              </div>

              <div className="credential-item">
                <div className="credential-header">
                  <span className="credential-label">رمز عبور:</span>
                  <button 
                    className="copy-button"
                    onClick={() => handleCopyToClipboard(studentCredentials.password)}
                  >
                    کپی
                  </button>
                </div>
                <div 
                  className="credential-value copyable"
                  onClick={() => handleCopyToClipboard(studentCredentials.password)}
                >
                  {studentCredentials.password}
                </div>
              </div>

              <div className="credentials-note">
                <div className="note-icon">⚠️</div>
                <p>این اطلاعات فقط یکبار قابل استفاده هستند. لطفاً آن‌ها را در اختیار دیگران قرار ندهید.</p>
              </div>
            </div>
          </div>

          {/* دکمه بستن */}
          <div className="success-actions">
            <button 
              className="close-success-button"
              onClick={handleCloseSuccessScreen}
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    );
  }

  // مودال اصلی پرداخت
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
          {/* ولت */}
          <div
            className={`payment-option ${selectedMethod === 'wallet' ? 'selected' : ''} ${!hasSufficientBalance ? 'insufficient' : ''
              }`}
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

          {/* آنلاین */}
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
              'پرداخت با کیف پول'
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