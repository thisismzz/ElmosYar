import React, { useState, useRef } from 'react';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { FoodItem } from "../../types/food_posts";
import './CreateFoodPost.css';
import Calendar from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import DateObject from 'react-date-object';

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
  const [selectedDate, setSelectedDate] = useState<DateObject>(() => {
    return new DateObject({ calendar: persian });
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    mealType: 'ناهار' as MealType,
    location: 'مرکزی' as LocationType,
  });

  const locations: LocationType[] = ['مرکزی', 'یاس', 'مقتدایی', 'خوابگاه خواهران', 'خوابگاه برادران'];
  const mealTypes: MealType[] = ['ناهار', 'شام'];

  const formatPersianDate = (date: DateObject): string => {
    if (!date) return '';
    
    const year = date.year;
    const month = date.month.toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  const handleCalendarIconClick = () => {
    setIsCalendarOpen(true);
    if (calendarRef.current && calendarRef.current.openCalendar) {
      calendarRef.current.openCalendar();
    }
  };

  const handleCalendarChange = (date: DateObject) => {
    setSelectedDate(date);
    setIsCalendarOpen(false);
  };

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

    if (!selectedDate) {
      alert('لطفاً تاریخ را انتخاب کنید');
      return;
    }

    const newFood: Omit<FoodItem, 'id' | 'isSoldOut'> = {
      name: formData.name.trim(),
      price: priceNumber,
      mealType: formData.mealType,
      location: formData.location,
      date: formatPersianDate(selectedDate)
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
    });
    setSelectedDate(new DateObject({ calendar: persian }));
    setIsCalendarOpen(false);
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

          {/* بخش تقویم یکپارچه */}
          <div className="form-group">
            <label>
              تاریخ
              <span className="required-star">*</span>
            </label>
            <div className="persian-calendar-container">
              <div className="calendar-input-wrapper">
                <div className="selected-date-display" onClick={handleCalendarIconClick}>
                  <div className="calendar-icon-minimal" onClick={handleCalendarIconClick}>
                    <CalendarIcon size={20} className="calendar-icon" />
                  </div>
                  <div className="date-display-content">
                    <div className="date-text">
                      <div className="date-value-large">
                        {selectedDate ? selectedDate.format("dddd، D MMMM YYYY") : 'برای انتخاب تاریخ کلیک کنید'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Calendar
                ref={calendarRef}
                value={selectedDate}
                onChange={handleCalendarChange}
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                className="persian-calendar-input"
                containerClassName="persian-calendar-wrapper"
                inputClass="custom-calendar-input"
                format="YYYY/MM/DD"
                required
                editable={false}
                placeholder="برای انتخاب تاریخ کلیک کنید"
                shadow={false}
                arrow={false}
                weekStartDayIndex={6}
                style={{ display: 'none' }}
              />
              {selectedDate && (
                <div className="date-actions-right">
                  <div className="date-info-right">
                  </div>
                  <button 
                    type="button" 
                    className="today-btn-small"
                    onClick={() => setSelectedDate(new DateObject({ calendar: persian }))}
                  >
                    امروز
                  </button>
                </div>
              )}
            </div>
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