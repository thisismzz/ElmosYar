import React, { useEffect, useState } from 'react';
import { FoodItem } from "../../../types/food_posts";
import { Sun, Moon, Plus } from 'lucide-react';
import PaymentModal from '../../Transaction/PaymentModal';
import { CreateFoodPost } from '../../../pages/CreatePost';
import './FoodPostFeed.css';

interface FoodPostCardProps {
	item: FoodItem;
	onBuy: (item: FoodItem) => void;

}

export const FoodPostCard: React.FC<FoodPostCardProps> = ({ item, onBuy }) => {

	const formatPrice = (price: number): string => {
		return `تومان ${price}`;
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
	);
};

// Type for days of week
type Day = "شنبه" | "یکشنبه" | "دوشنبه" | "سه شنبه" | "چهارشنبه" | "پنج شنبه" | "جمعه";

interface FoodPostFeedProps {
	items: FoodItem[];
	isLoading?: boolean;
}

export const FoodPostFeed: React.FC<FoodPostFeedProps> = ({ items: initialItems , isLoading = false}) => {
	const [items, setItems] = useState<FoodItem[]>(initialItems || []);
	const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [selectedDay, setSelectedDay] = useState<Day>("شنبه");

	

	
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

	const handleCloseAddModal = () => {
		setIsAddModalOpen(false);
	};

	const handlePaymentSuccess = (_method: any, foodItem: FoodItem) => {
		setItems(prev => prev.map(i => i.id === foodItem.id ? { ...i, isSoldOut: true } : i));
	};

	const handleAddFood = (newFoodData: Omit<FoodItem, 'id' | 'isSoldOut'>) => {
		// Create new food item with unique ID
		const newFood: FoodItem = {
			...newFoodData,
			id: Date.now().toString(),
			isSoldOut: false
		};
		
		// Add to the beginning of the list
		setItems(prev => [newFood, ...prev]);
		setIsAddModalOpen(false);
		
		// Show success message
		alert(`غذای ${newFood.name} با موفقیت اضافه شد!`);
	};

	const handleDayChange = (day: Day) => {
		setSelectedDay(day);
		// Here you can add logic to filter items by day
		// For now, we'll just show all items
	};

	if (isLoading) {
		return (
			<div className="food-order-container loading">
				<div className="loading-overlay">
					<div className="loading-spinner"></div>
					<span>در حال بارگذاری غذاها...</span>
				</div>
			</div>
		);
	}

	return (
		<div className={`food-order-container ${items.length === 1 ? 'single-item' : ''}`}>
			{/* <div className="food-header">
				<div className="header-top">
					<div className="header-title-section">
						<h2 className="page-title">سفارش غذا</h2>
						<p className="page-subtitle">منوی امروز - انتخاب و سفارش آنلاین</p>
					</div>
					
					<button 
						className="add-post-button"
						onClick={() => setIsAddModalOpen(true)}
					>
						<Plus size={20} />
						<span>اضافه کردن پست جدید</span>
					</button>
				</div>
			</div> */}

			{items.length === 0 ? (
				<div className="food-empty-state">
					<div className="empty-state-icon">🍽️</div>
					<h3>هیچ غذایی موجود نیست</h3>
					<p>برای شروع، غذای جدیدی اضافه کنید</p>
					<button 
						className="add-post-button empty-state-button"
						onClick={() => setIsAddModalOpen(true)}
					>
						<Plus size={20} />
						<span>اضافه کردن اولین غذا</span>
					</button>
				</div>
			) : (
				<>
					<div className={`food-items-grid ${items.length === 1 ? 'single-item-grid' : ''}`}>
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

			<CreateFoodPost
				isOpen={isAddModalOpen}
				onClose={handleCloseAddModal}
				onAdd={handleAddFood}
			/>
		</div>
	);
};