export interface FoodItem {
  id: string;
  name: string;
  mealType: string;
  location: string;
  date: string;
  price: number;
  isSoldOut: boolean;
}

export interface FoodOrderProps {
  items?: FoodItem[];
  onBuyFood?: (item: FoodItem) => void;
  className?: string;
}