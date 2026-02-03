import React, { useEffect, useState } from 'react';
import { FoodItem } from "../../../types/food_posts";
import { Sun, Moon, Plus } from 'lucide-react';
import {PaymentModal} from '../../Transaction/PaymentModal';
import './FoodPostFeed.css';
import { getCurrentUserProfile } from '../../../services/userProfileService';
import DateObject from "react-date-object";
import persianCalendar from "react-date-object/calendars/persian";
import gregorianCalendar from "react-date-object/calendars/gregorian";

type DayType = 'شنبه' | 'یکشنبه' | 'دوشنبه' | 'سه‌شنبه' | 'چهارشنبه' | 'پنج‌شنبه' | 'جمعه';

// Helper function to convert Persian digits to Western digits
const persianToWestern = (str: string): string => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const westernDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    
    return str.replace(/[۰-۹]/g, (digit) => {
        const index = persianDigits.indexOf(digit);
        return index !== -1 ? westernDigits[index] : digit;
    });
};

// Helper function to convert Western digits to Persian digits
const westernToPersian = (str: string | number): string => {
    const westernDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    
    return str.toString().replace(/[0-9]/g, (digit) => {
        const index = westernDigits.indexOf(digit);
        return index !== -1 ? persianDigits[index] : digit;
    });
};

// Function to get Persian day name from DateObject
const getPersianDayFromDate = (date: DateObject): DayType => {
    const dayIndex = date.weekDay.index; // 0 = Saturday in Persian calendar
    const persianDays: DayType[] = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
    return persianDays[dayIndex];
};

// Function to get Persian month name from DateObject
const getPersianMonthName = (date: DateObject): string => {
    // The month property should already be in Persian if using Persian locale
    // But we can also use the month index to get the name
    const monthIndex = date.month.index; // 0 = Farvardin
    const persianMonths = [
        'فروردین',
        'اردیبهشت',
        'خرداد',
        'تیر',
        'مرداد',
        'شهریور',
        'مهر',
        'آبان',
        'آذر',
        'دی',
        'بهمن',
        'اسفند'
    ];
    return persianMonths[monthIndex] || date.month.name;
};

// Main function: Converts Gregorian string with Persian digits to Persian date string
function formatGregorianToPersian(gregorianDateStr: string): string {
    try {
        // 1. Convert Persian digits to Western digits
        const westernDateStr = persianToWestern(gregorianDateStr);
        
        // 2. Parse the Gregorian date
        const [yearStr, monthStr, dayStr] = westernDateStr.split('-');
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10);
        const day = parseInt(dayStr, 10);
        
        // 3. Create DateObject in Gregorian calendar
        const gregorianDate = new DateObject({
            year,
            month,
            day,
            calendar: gregorianCalendar
        });
        
        // 4. Convert to Persian calendar
        const persianDate = gregorianDate.convert(persianCalendar);
        
        // 5. Get day name using your existing function
        const dayName = getPersianDayFromDate(persianDate);
        
        // 6. Get month name
        const monthName = getPersianMonthName(persianDate);
        
        // 7. Convert day number to Persian digits
        const dayPersian = westernToPersian(persianDate.day);
        
        // 8. Return formatted string
        return `${dayName}، ${dayPersian} ${monthName}`;
        
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'تاریخ نامعتبر';
    }
}

// Alternative: Get DateObject from Gregorian string
function gregorianToPersianDateObject(gregorianDateStr: string): DateObject {
    const westernDateStr = persianToWestern(gregorianDateStr);
    const [yearStr, monthStr, dayStr] = westernDateStr.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    
    const gregorianDate = new DateObject({
        year,
        month,
        day,
        calendar: gregorianCalendar
    });
    
    return gregorianDate.convert(persianCalendar);
}


interface FoodPostCardProps {
    item: FoodItem;
    onBuy: (item: FoodItem) => void;
    currentUsername: string;

}




export const FoodPostCard: React.FC<FoodPostCardProps> = ({ item, onBuy, currentUsername }) => {

    const formatPrice = (price: number): string => {
        return `${price} تومان`;
    };

    return (
        <div key={item.id} className={`food-card ${(item.isSoldOut === "false" || item.isSoldOut === false) ? 'sold-out' : ''}`}>
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
                        {/* <span className="detail-icon">⏰</span> */}
                        <div className="detail-content">
                            <span className="detail-label">وعده</span>
                            <span className="detail-value">{item.mealType == "dinner" ? "شام" : item.mealType == "breakfast" ? "صبحانه" : item.mealType == "lunch" ? "ناهار" : "bad format"}</span>
                        </div>
                    </div>

                    <div className="detail-item">
                        {/* <span className="detail-icon">📍</span> */}
                        <div className="detail-content">
                            <span className="detail-label">سلف</span>
                            <span className="detail-value">{item.location == "yas" ? "یاس" :
                                item.location == "dormitory_f" ? "خوابگاه خواهران" :
                                    item.location == "central_m" ? "مرکزی برادران" :
                                        item.location == "rashid" ? "رشید" :
                                            item.location == "hakimieh" ? "حکیمیه" :
                                                item.location == "seraj" ? "سراج" :
                                                    item.location == "bagheri" ? "باقری" :
                                                        item.location == "farjam" ? "فرجام" :
                                                            item.location == "majidieh" ? "مجیدیه" :
                                                                item.location == "basij" ? "بسیج" :
                                                                    "bad format"}</span>
                        </div>
                    </div>

                    <div className="detail-item">
                        {/* <span className="detail-icon">📅</span> */}
                        <div className="detail-content">
                            <span className="detail-label">تاریخ</span>
                            <span className="detail-value">{formatGregorianToPersian(item.date)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-footer">
                {(item.isSoldOut === true || item.isSoldOut === "true") ? (
                    <div className="sold-out-section">
                        <span className="sold-out-badge">تمام شده</span>
                        <span className="sold-out-text">این غذا فعلاً موجود نیست</span>
                    </div>
                ) : (
                    <button
                        className="w-full bg-[#16519f] text-white border-none rounded-[16px] 
               px-[25px] py-[20px] text-[17px] font-bold cursor-pointer 
               transition-all duration-300 ease-in-out flex items-center 
               justify-between shadow-[0_6px_20px_rgba(52,152,219,0.3)] gap-[10px]
               hover:-translate-y-[2px] hover:shadow-[0_8px_25px_rgba(52,152,219,0.4)]
               disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed 
               disabled:hover:transform-none disabled:hover:shadow-none"
                        onClick={() => onBuy(item)}
                        disabled={item.sellerUsername == currentUsername || item.sellerUsername == ""}
                    >
                        <span className="button-text">
                            {
                                item.sellerUsername == currentUsername
                                    ? " این پست را شما گذاشته اید "
                                    : item.sellerUsername == ""
                                        ? " خطا در بارگیری نام کاربری"
                                        : "خرید"
                            }
                        </span>
                    </button>
                )}
            </div>

            {(item.isSoldOut === true || item.isSoldOut === "true") && (
                <div className="sold-out-overlay">
                    <span>تمام شده</span>
                </div>
            )}
        </div>
    );
};


interface FoodPostFeedProps {
    items: FoodItem[];
    isLoading?: boolean;
}

export const FoodPostFeed: React.FC<FoodPostFeedProps> = ({ items: initialItems, isLoading = false }) => {
    const [items, setItems] = useState<FoodItem[]>(initialItems || []);
    const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [currentUsername, setCurrentUsername] = useState("");


    const handleBuyFood = (item: FoodItem) => {
        if (item.isSoldOut === true || item.isSoldOut === "true") {
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
        setItems(prev => prev.map(i => i.id === foodItem.id ? { ...i, isSoldOut: "true" } : i));
    };

    useEffect(
        () => {
            const updateUsername = async () => {
                const username = await getCurrentUserProfile();
                setCurrentUsername(username.username);
            }

            console.log("items", items);

            updateUsername();
        }
    );

    if (isLoading) {
        return (
            <div className="food-order-container loading">
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <span>در حال بارگذاری غذاها...</span>
                </div>
            </div>
        );
    };



    return (
        <div className={`food-order-container ${items.length === 1 ? 'single-item' : 'double-item'}`}>
            {items.length === 0 ? (
                <div className="food-empty-state">
                    <div className="empty-state-icon">🍽️</div>
                    <h3>هیچ غذایی موجود نیست</h3>
                    <p>برای شروع، غذای جدیدی اضافه کنید</p>
                    <button
                        className="empty-state-button"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                    </button>
                </div>
            ) : (
                <>
                    <div className={`food-items-grid ${items.length === 1 ? 'single-item-grid' : 'double-item-grid'}`}>
                        {items.map((item) => (
                            <FoodPostCard key={item.id} item={item} onBuy={handleBuyFood} currentUsername={currentUsername} />
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
        </div>
    );
};