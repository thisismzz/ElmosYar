import React, { useState } from 'react';
import { X } from 'lucide-react';
import { FoodItem } from "../../types/food_posts";
import './AddFoodModal.css';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newFood: Omit<FoodItem, 'id' | 'isSoldOut'>) => void;
}

type MealType = 'ناهار' | 'شام';
type LocationType = 'مرکزی' | 'یاس' | 'مقتدایی' | 'خوابگاه خواهران' | 'خوابگاه برادران';

const AddFoodModal: React.FC<AddFoodModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    mealType: 'ناهار' as MealType,
    location: 'مرکزی' as LocationType,
    date: new Date().toISOString().split('T')[0]
  });

  const locations: LocationType[] = ['مرکزی', 'یاس', 'مقتدایی', 'خوابگاه خواهران', 'خوابگاه برادران'];
  const mealTypes: MealType[] = ['ناهار', 'شام'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.price) {
      alert('لطفاً نام و قیمت غذا را وارد کنید');
      return;
    }

    const priceNumber = parseFloat(formData.price);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      alert('لطفاً قیمت معتبر وارد کنید');
      return;
    }

    const newFood: Omit<FoodItem, 'id' | 'isSoldOut'> = {
      name: formData.name.trim(),
      price: priceNumber,
      mealType: formData.mealType,
      location: formData.location,
      date: formData.date
    };
    
    onAdd(newFood);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      price: '',
      mealType: 'ناهار',
      location: 'مرکزی',
      date: new Date().toISOString().split('T')[0]
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay add-food-modal-overlay">
      <div className="modal-content add-food-modal-content">
        <div className="modal-header">
          <h2 className="modal-title">اضافه کردن غذای جدید</h2>
          <button className="modal-close" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="food-form">
          <div className="form-group">
            <label htmlFor="name">
              نام غذا
              <span className="required-star">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              placeholder="مثال: چلو کباب"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">
              قیمت ($)
              <span className="required-star">*</span>
            </label>
            <input
              type="number"
              id="price"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
              min="0"
              step="1000"
              placeholder="0"
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="mealType">
                وعده غذایی
                <span className="required-star">*</span>
              </label>
              <select
                id="mealType"
                value={formData.mealType}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'ناهار' || value === 'شام') {
                    setFormData({...formData, mealType: value});
                  }
                }}
                className="form-select"
              >
                {mealTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="location">
                سلف
                <span className="required-star">*</span>
              </label>
              <select
                id="location"
                value={formData.location}
                onChange={(e) => {
                  const value = e.target.value;
                  if (locations.includes(value as LocationType)) {
                    setFormData({...formData, location: value as LocationType});
                  }
                }}
                className="form-select"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="date">
              تاریخ
              <span className="required-star">*</span>
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
              className="form-input"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={handleClose}>
              انصراف
            </button>
            <button type="submit" className="submit-button">
              اضافه کردن غذا
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFoodModal;