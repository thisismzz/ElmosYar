import React, { useEffect, useState } from 'react';
import './PaymentModal.css';
import { PaymentModalProps, PaymentMethod, FoodItem } from '../../types/food_posts';
import { getWalletData, depositToWallet, withdrawFromWallet, walletPurchase } from '../../services/paymentService';

const PaymentModal: React.FC<PaymentModalProps> = ({
	isOpen,
	onClose,
	onPaymentSuccess,
	foodItem,
	//   walletBalance
}) => {
	const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [walletBalance, setWalletBalance] = useState(0);

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
					alert(`پرداخت با کیف پول انجام شد. مبلغ ${formatNumber(foodItem.price)} تومان کسر شد.`);
					if (onPaymentSuccess) {
						onPaymentSuccess(selectedMethod, foodItem);
					}
				}
				else {
					alert(purchaseResult.message);
				}
			} else {
				alert('به صفحه پرداخت آنلاین منتقل می‌شوید...'); //TODO
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

				{/* گزینه‌های پرداخت */}
				<div className="payment-options">
					{/* گزینه ۱: ولت */}
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