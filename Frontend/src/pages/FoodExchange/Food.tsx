import React from 'react';
import './Food.css';
import { FoodItem } from '../../types/food_posts';
import { FoodPostFeed } from '../../components/Food/Posts/FoodPostFeed';

const Food: React.FC = () => {
  const foodItems: FoodItem[] = [
    {
      id: '1',
      name: 'سالاد سزار',
      mealType: 'ناهار',
      location: 'کافه دانشکده مدیریت',
      date: 'سه شنبه، ۲۳ آبان',
      price: 5.5,
      isSoldOut: true
    },	
    {
      id: '2',
      name: 'پاستا الفردو',
      mealType: 'ناهار',
      location: 'سلف دانشکده مهندسی',
      date: 'سه شنبه، ۲۳ آبان',
      price: 9,
      isSoldOut: true
    },
    {
      id: '3',
      name: 'چلو خورشت قیمه',
      mealType: 'ناهار',
      location: 'سلف مرکزی',
      date: 'سه شنبه، ۲۳ آبان',
      price: 4.5,
      isSoldOut: false
    },
    {
      id: '4',
      name: 'چلوکباب کوبیده',
      mealType: 'شام',
      location: 'رستوران دانشکده فنی',
      date: 'سه شنبه، ۲۳ آبان',
      price: 12,
      isSoldOut: false
    }
  ];

  return (
    FoodPostFeed(foodItems)
  );
};

export default Food;