import { ReactNode } from "react";

export type PaymentMethod = 'wallet' | 'online';

export interface FoodItem {
//   day: ReactNode; //??
  id: string;
  name: string;
  mealType: string;
  location: string;
  date: string;
  price: number;
  isSoldOut: boolean;
}

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: (method: PaymentMethod, foodItem: FoodItem) => void;
  foodItem: FoodItem;
}

export interface FoodOrder {
  id: string;
  foodItem: FoodItem;
  paymentMethod: PaymentMethod;
  orderDate: Date;
  totalAmount: number;
  status: 'pending' | 'completed' | 'failed';
}

export interface FoodOrderProps {
  items?: FoodItem[];
  onBuyFood?: (item: FoodItem) => void;
  className?: string;
}


export type FoodPostSearchProps = {
	day?: "saturday" | "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday",
	name?: string,
	mealType?: "ناهار"|"شام",
	location?: "سلف مرکزی" | "سلف یاس" | "خوابگاه حکیمیه" | "خوابگاه خواهران" | "خوابگاه برادران" | "خوابگاه سراج" | "خوابگاه مجیدیه",
	date?: string,
	price?: [number, number],
	isSoldOut?: boolean,
}