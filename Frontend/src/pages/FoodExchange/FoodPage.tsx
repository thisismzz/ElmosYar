import React, { useEffect, useState } from 'react';
import './FoodPage.css';
import { FoodItem } from '../../types/food_posts';
import { FoodPostFeed } from '../../components/Food/Posts/FoodPostFeed';
import FoodFilters from '../../components/Food/Filter/FoodFilters';


const FoodPage: React.FC = () => {
 
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        setLoading(true);
        // مثال: const response = await foodService.getFoodItems();
        // setFoodItems(response.data);
        
        setFoodItems([]);
      } catch (err) {
        setError('خطا در دریافت اطلاعات غذاها');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFoodItems();
  }, []);

  if (loading) {
    return (
      <div className="food-page-container">
        <div className="loading-state">
          <p>در حال دریافت اطلاعات غذاها...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="food-page-container">
        <div className="error-state">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="food-page-container">
      <div className="food-page-header">
      </div>
      <FoodFilters />
      <FoodPostFeed items={foodItems} />
    </div>
  );
};

export default FoodPage;