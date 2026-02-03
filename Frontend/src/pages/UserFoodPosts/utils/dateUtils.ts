// src/components/Food/UserFoodPosts/utils/dateUtils.ts
import DateObject from "react-date-object";
import persianCalendar from "react-date-object/calendars/persian";
import gregorianCalendar from "react-date-object/calendars/gregorian";

// Helper function to convert Persian digits to Western digits
const persianToWestern = (str: string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const westernDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  return str.replace(/[۰-۹]/g, (digit) => {
    const index = persianDigits.indexOf(digit);
    return index !== -1 ? westernDigits[index] : digit;
  });
};

// Main function: Converts Gregorian string with Persian digits to Persian date string
export function formatGregorianToPersian(gregorianDateStr: string): string {
  try {
    // 1. Convert Persian digits to Western digits
    const westernDateStr = persianToWestern(gregorianDateStr);
    
    // 2. Parse the Gregorian date
    const [yearStr, monthStr, dayStr] = westernDateStr.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    
    // 3. Create DateObject in Gregorian calendar and convert to Persian
    const gregorianDate = new DateObject({
      year,
      month,
      day,
      calendar: gregorianCalendar
    });
    
    const persianDate = gregorianDate.convert(persianCalendar);
    
    // 4. Format: Day of week, day month
    const persianDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
    const dayName = persianDays[persianDate.weekDay.index];
    
    const persianMonths = [
      'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];
    const monthName = persianMonths[persianDate.month.index];
    
    return `${dayName}، ${persianDate.day} ${monthName}`;
    
  } catch (error) {
    console.error('Error formatting date:', error);
    return gregorianDateStr; // Return original if formatting fails
  }
}

// Alternative: Simple day name from English day
export function getPersianDayName(englishDay: string): string {
  const dayMap: Record<string, string> = {
    'saturday': 'شنبه',
    'sunday': 'یکشنبه',
    'monday': 'دوشنبه',
    'tuesday': 'سه‌شنبه',
    'wednesday': 'چهارشنبه',
    'thursday': 'پنج‌شنبه',
    'friday': 'جمعه',
  };
  
  return dayMap[englishDay.toLowerCase()] || englishDay;
}