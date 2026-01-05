import React, { useMemo } from 'react';
import './FoodPage.css';
import { FoodItem } from '../../types/food_posts';
import { FoodPostFeed } from '../../components/Food/Posts/FoodPostFeed';
import FoodFilters from '../../components/Food/Filter/FoodFilters';
import { usePosts } from '../../hooks/usePosts';
import type { Post } from '../../types/discussion_posts';
import { FilterButtonConnected } from '../../components/FilterButtonConnected';
type FilterKey = "day" | "cafeteria" | "meal";
type FilterVal = string;

const fields = [
  {
    key: "day",
    label: "روز",
    placeholder: "همه",
    options: [
      { value: "saturday", label: "شنبه" },
      { value: "sunday", label: "یکشنبه" },
      // ...
    ],
  },
  {
    key: "meal",
    label: "وعده",
    placeholder: "همه",
    options: [
      { value: "lunch", label: "ناهار" },
      { value: "dinner", label: "شام" },
    ],
  },
];

type K = (typeof fields)[number]["key"];
type V = (typeof fields)[number]["options"][number]["value"];


const mapPostToFoodItem = (post: Post): FoodItem => ({
	id: post.id,
	name: post.attributes.name,
	mealType: post.attributes.mealType,
	location: post.attributes.location,
	date: post.attributes.date,
	day: post.attributes.day,
	price: post.attributes.price,
	isSoldOut: post.attributes.isSoldOut === "true",
});

const FoodPage: React.FC = () => {
	const { posts, loading, error } = usePosts({ 
		allowedSearchKeys: ['mealType', 'location', 'day', 'name']
	});
	
	const foodItems = useMemo(() => 
		posts.map(mapPostToFoodItem),
		[posts]
	);

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
			{/* <FilterButton fields={filterFields} values={filters} onChange={setFilters} /> */}
			 <FilterButtonConnected<K, V>
        fields={fields}
        className="ml-2"
        // allowedKeys={["day", "meal"]} // optional
      />
			<FoodPostFeed items={foodItems} />
		</div>
	);
};

export default FoodPage;