// PaymentModal.tsx
import React, { useEffect, useState } from 'react';
import { Modal, modalBtnGhost, modalBtnPrimary } from "../Wallet/Modal"
import { Button } from '../UILib';
import { PaymentModalProps, PaymentMethod, FoodItem } from '../../types/food_posts';
import { getWalletData, createPayment, verifyPayment, getUserInfo } from '../../services/paymentService';
import { useNavigate } from 'react-router-dom';

// Helper function to format numbers with Persian digits
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fa-IR').format(num);
};

export function PaymentModal({ 
  isOpen, 
  onClose, 
  onPaymentSuccess, 
  foodItem 
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [screen, setScreen] = useState<'payment' | 'success'>('payment');
  const [studentCredentials, setStudentCredentials] = useState({
    studentId: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Fetch wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!isOpen) return;
      
      try {
        const result = await getWalletData();
        setWalletBalance(result.balance);
      } catch (err) {
        console.error('Error fetching wallet balance:', err);
      }
    };

    fetchWalletBalance();
  }, [isOpen]);

  // Reset state when modal closes
  const handleClose = () => {
    setSelectedMethod(null);
    setIsProcessing(false);
    setScreen('payment');
    setError(null);
    onClose();
  };

  const afterPaymentBalance = walletBalance - foodItem.price;
  const hasSufficientBalance = afterPaymentBalance >= 0;

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Optional: Show a toast instead of alert
      })
      .catch(err => {
        console.error('Error copying to clipboard:', err);
      });
  };

  const handlePayment = async () => {
    if (!selectedMethod) return;

    if (selectedMethod === 'wallet' && !hasSufficientBalance) {
      setError('موجودی کیف پول شما کافی نیست. لطفا روش دیگری انتخاب کنید.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Create payment
      const createPaymentResult = await createPayment(foodItem.id);
      const paymentUrl = createPaymentResult.payment_url;
      const authority = paymentUrl.split('/')[2];

      if (selectedMethod === 'wallet') {
        // Step 2: Verify payment for wallet method
        const verificationResult = await verifyPayment(authority);
        
        if (verificationResult.successful) {
          // Get seller info for credentials
          const sellerInfo = await getUserInfo(foodItem.sellerUsername);
          setStudentCredentials({
            studentId: sellerInfo.student_id,
            password: sellerInfo.info || '1234' // Default fallback
          });
          
          setScreen('success');
          if (onPaymentSuccess) {
            onPaymentSuccess(selectedMethod, foodItem);
          }
        } else {
          setError(verificationResult.message || 'پرداخت ناموفق بود');
        }
      } else {
        // Online payment - redirect to gateway
        navigate(`/wallet/buy-food-gateway/${foodItem.id}`, {
          state: {
            amount: foodItem.price,
            gateway: { id: "mockpay", name: "باقرپی" },
            auth: authority
          },
        });
        handleClose();
      }
    } catch (error: any) {
      console.error('Payment failed:', error);
      setError(error.response?.data?.message || 'پرداخت با خطا مواجه شد. لطفا مجددا تلاش کنید.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Success Screen Component
  const SuccessScreen = () => (
    <div className="space-y-4 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
      <div className="flex flex-col items-center justify-center py-2">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">پرداخت موفق</h3>
        <p className="text-sm text-gray-600">خرید شما با موفقیت ثبت شد</p>
      </div>

      <div className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">نام غذا:</span>
          <span className="font-semibold text-gray-900">{foodItem.name}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">مبلغ پرداختی:</span>
          <span className="font-semibold text-green-600">{formatNumber(foodItem.price)} تومان</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">موجودی جدید:</span>
          <span className="font-semibold text-gray-900">{formatNumber(afterPaymentBalance)} تومان</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">زمان خرید:</span>
          <span className="font-semibold text-gray-900">
            {new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-center">
          <h4 className="text-sm font-semibold text-gray-900">اطلاعات دسترسی به غذا</h4>
          <p className="text-xs text-gray-500">لطفاً اطلاعات زیر را به مسئول سالن غذا ارائه دهید:</p>
        </div>

        <div className="space-y-2">
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between bg-gray-50 px-3 py-2">
              <span className="text-xs font-medium text-gray-700">شماره دانشجویی</span>
              <button
                onClick={() => handleCopyToClipboard(studentCredentials.studentId)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                کپی
              </button>
            </div>
            <div 
              onClick={() => handleCopyToClipboard(studentCredentials.studentId)}
              className="px-3 py-3 font-mono text-center text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              {studentCredentials.studentId}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between bg-gray-50 px-3 py-2">
              <span className="text-xs font-medium text-gray-700">رمز عبور</span>
              <button
                onClick={() => handleCopyToClipboard(studentCredentials.password)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                کپی
              </button>
            </div>
            <div 
              onClick={() => handleCopyToClipboard(studentCredentials.password)}
              className="px-3 py-3 font-mono text-center text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              {studentCredentials.password}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-start gap-2">
            <svg className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.856-.833-2.664 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-xs text-amber-800">
              این اطلاعات فقط یکبار قابل استفاده هستند. لطفاً آن‌ها را در اختیار دیگران قرار ندهید.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Payment Selection Screen Component
  const PaymentSelectionScreen = () => (
    <div className="space-y-4 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">هزینه غذا</span>
          <span className="font-semibold text-gray-900">{formatNumber(foodItem.price)} تومان</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-gray-600">موجودی فعلی</span>
          <span className="font-semibold text-gray-900">{formatNumber(walletBalance)} تومان</span>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div
          onClick={() => {
            setSelectedMethod('wallet');
            setError(null);
          }}
          className={`rounded-xl border p-4 transition-all cursor-pointer ${
            selectedMethod === 'wallet'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                  selectedMethod === 'wallet' 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300'
                }`}>
                  {selectedMethod === 'wallet' && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-900">استفاده از کیف پول</span>
              </div>
              
              <div className="mt-3 space-y-2 pr-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">هزینه غذا:</span>
                  <span className="font-medium text-gray-900">{formatNumber(foodItem.price)} تومان</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">موجودی پس از پرداخت:</span>
                  <span className={`font-medium ${
                    hasSufficientBalance ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {formatNumber(afterPaymentBalance)} تومان
                  </span>
                </div>
                
                {!hasSufficientBalance && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.856-.833-2.664 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span>موجودی کیف پول کافی نیست</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={() => {
            setSelectedMethod('online');
            setError(null);
          }}
          className={`rounded-xl border p-4 transition-all cursor-pointer ${
            selectedMethod === 'online'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                  selectedMethod === 'online' 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300'
                }`}>
                  {selectedMethod === 'online' && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-900">پرداخت آنلاین</span>
              </div>
              
              <div className="mt-3 pr-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">هزینه غذا:</span>
                  <span className="font-medium text-gray-900">{formatNumber(foodItem.price)} تومان</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  پس از تأیید، به صفحه پرداخت آنلاین منتقل می‌شوید.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-3">
        <div className="text-xs text-gray-600 mb-2">جزئیات سفارش</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-gray-500">وعده:</div>
            <div className="font-medium">{foodItem.mealType === 'lunch' ? 'ناهار' : 'شام'}</div>
          </div>
          <div>
            <div className="text-gray-500">تاریخ:</div>
            <div className="font-medium">{foodItem.date}</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Modal Footer Buttons
  const renderFooter = () => {
    if (screen === 'success') {
      return (
        <Button 
          className={modalBtnPrimary} 
          onClick={handleClose}
        >
          بستن
        </Button>
      );
    }

    return (
      <>
        <Button 
          className={modalBtnGhost} 
          onClick={handleClose} 
          disabled={isProcessing}
        >
          انصراف
        </Button>
        <Button 
          className={modalBtnPrimary} 
          onClick={handlePayment}
          disabled={!selectedMethod || isProcessing}
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              در حال پردازش...
            </span>
          ) : selectedMethod === 'wallet' ? (
            'پرداخت با کیف پول'
          ) : (
            'ادامه به پرداخت آنلاین'
          )}
        </Button>
      </>
    );
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title={screen === 'success' ? '' : 'پرداخت هزینه غذا'}
      subtitle={screen === 'success' ? '' : 'انتخاب روش پرداخت'}
      footer={renderFooter()}
      size="md"
    >
      {screen === 'success' ? <SuccessScreen /> : <PaymentSelectionScreen />}
    </Modal>
  );
}