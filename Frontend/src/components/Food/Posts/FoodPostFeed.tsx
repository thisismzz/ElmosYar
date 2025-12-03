import { FoodItem } from "../../../types/food_posts"
import { Sun, Moon } from 'lucide-react'


export const FoodPostCard = (item: FoodItem) => {
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
	)
}


//! add props
export const FoodPostFeed = (foodItems: FoodItem[]) => {
	return (
		<div className="food-order-container">
			<div className="food-header">
				<h2 className="page-title">سفارش غذا</h2>
				<p className="page-subtitle">منوی امروز - انتخاب و سفارش آنلاین</p>
			</div>

			<div className="food-items-grid">
				{foodItems.map((item) => (
					FoodPostCard(item)
				))}

			</div>
		</div>
	)
}