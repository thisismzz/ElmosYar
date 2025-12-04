import React, { useState, useEffect } from 'react';
import { FoodItem } from "../../../../types/food_posts";
import { Sun, Moon } from 'lucide-react';
import PaymentModal from '../../../Transaction/PaymentModal';
import { useFilters } from '../../../../contexts/FilterContext';
import './FoodPostFeed.css';

interface FoodPostCardProps {
	item: FoodItem;
	onBuy: (item: FoodItem) => void;
}

export const FoodPostCard: React.FC<FoodPostCardProps> = ({ item, onBuy }) => {
	const formatPrice = (price: number): string => {
		return `$${price}`;
	};

	const getMealTypeIcon = (mealType: string) => {
		switch (mealType) {
			case 'ناهار':
				return <Sun />;
			case 'شام':
				return <Moon />;
			default:
				return '🍽️';
		}
	};

	return (
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
							<span className="detail-label">مکان</span>
							<span className="detail-value">{item.location}</span>
						</div>
					</div>

					<div className="detail-item">
						<span className="detail-icon">📅</span>
						<div className="detail-content">
							<span className="detail-label">روز</span>
							<span className="detail-value">{item.day}</span>
						</div>
					</div>

					<div className="detail-item">
						<span className="detail-icon">📆</span>
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
						onClick={() => onBuy(item)}
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
	)
}

interface FoodPostFeedProps {
	items: FoodItem[];
}

export const FoodPostFeed: React.FC<FoodPostFeedProps> = ({ items: initialItems }) => {
	const [items, setItems] = useState<FoodItem[]>(initialItems || []);
	const [filteredItems, setFilteredItems] = useState<FoodItem[]>(initialItems || []);
	const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { filters } = useFilters();

	const walletBalance = 50000; // placeholder; replace with real balance from context/service

	// Mapping objects for filter values
	useEffect(() => {
		let result = items;

		if (filters.mealType !== 'all') {
			const mealTypeMap: { [key: string]: string } = {
				'lunch': 'ناهار',
				'dinner': 'شام'
			};
			const mealTypeValue = mealTypeMap[filters.mealType] || filters.mealType;
			result = result.filter(item => item.mealType === mealTypeValue);
		}

		if (filters.location !== 'all') {
			const locationMap: { [key: string]: string } = {
				'yas': 'سلف یاس(خواهران)',
				'dormitory_f': 'سلف خوابگاه خواهران',
				'central_m': 'سلف مرکزی(برادران)',
				'rashid': 'خوابگاه رشید',
				'hakimieh': 'خوابگاه حکیمیه',
				'seraj': 'خوابگاه سراج',
				'bagheri': 'خوابگاه باقری',
				'farjam': 'خوابگاه فرجام',
				'majidieh': 'خوابگاه مجیدیه',
				'basij': 'خوابگاه کوی بسیج'
			};
			const locationValue = locationMap[filters.location] || filters.location;
			result = result.filter(item => item.location === locationValue);
		}

		if (filters.day !== 'all') {
			const dayMap: { [key: string]: string } = {
				'saturday': 'شنبه',
				'sunday': 'یکشنبه',
				'monday': 'دوشنبه',
				'tuesday': 'سه‌شنبه',
				'wednesday': 'چهارشنبه',
				'thursday': 'پنج‌شنبه'
			};
			const dayValue = dayMap[filters.day] || filters.day;
			result = result.filter(item => item.day === dayValue);
		}

		setFilteredItems(result);
	}, [items, filters]);

	// Filter items based on applied filters
	useEffect(() => {
		setItems(initialItems || []);
		setFilteredItems(initialItems || []);
	}, [initialItems]);

	const handleBuyFood = (item: FoodItem) => {
		if (item.isSoldOut) {
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
		// mark item as sold out (or remove) after successful payment
		setItems(prev => prev.map(i => i.id === foodItem.id ? { ...i, isSoldOut: true } : i));
	};

	return (
		<div className="food-order-container">
			<div className="food-header">
				<h2 className="page-title">سفارش غذا</h2>
				<p className="page-subtitle">منوی امروز - انتخاب و سفارش آنلاین</p>
			</div>

			<div className="food-items-grid">
				{filteredItems.length === 0 ? (
					<div className="no-items-message">
						<p>هیچ غذایی با فیلترهای انتخابی شما یافت نشد.</p>
					</div>
				) : (
					filteredItems.map((item) => (
						<FoodPostCard key={item.id} item={item} onBuy={handleBuyFood} />
					))
				)}
			</div>

			{selectedItem && (
				<PaymentModal
					isOpen={isModalOpen}
					onClose={handleCloseModal}
					onPaymentSuccess={handlePaymentSuccess}
					foodItem={selectedItem}
					walletBalance={walletBalance}
				/>
			)}
		</div>
	)
}