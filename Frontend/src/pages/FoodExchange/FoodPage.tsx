import React, { useEffect, useState, useMemo } from 'react';
import './FoodPage.css';
import { FoodItem } from '../../types/food_posts';
import { FoodPostFeed } from '../../components/Food/Posts/FoodPostFeed';
import FoodFilters from '../../components/Food/Filter/FoodFilters';
import { postService } from '../../services/PostService';
import { useFilters } from '../../contexts/FilterContext';
import { FoodPostSearchProps } from '../../types/food_posts';


const FoodPage: React.FC = () => {
	const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { getFilter, serializeSearch } = useFilters();

	// Get filter values with defaults
	const mealType = getFilter('mealType', '');
	const location = getFilter('location', '');
	const day = getFilter('day', '');
	const searchQuery = getFilter('q', '');
	
	// Create filter dependency array for useEffect
	const filterDependencies = useMemo(() => {
		return { mealType, location, day, searchQuery };
	}, [mealType, location, day, searchQuery]);

		const getFoodPosts = async (search?: string): Promise<FoodItem[]> => {

			const food_posts = await postService.getPosts({
				category: "food",
				search,
			});

		const result: FoodItem[] = [];

		for (const post of food_posts.posts) {
			const post_content_json = post.attributes;
			result.push({
				id: post_content_json.id,
				name: post_content_json.name,
				mealType: post_content_json.mealType,
				location: post_content_json.location,
				date: post_content_json.date,
				price: post_content_json.price,
				isSoldOut: post_content_json.isSoldOut == "true",
			});
		}

		return result;
	};

	// Temporary, will remove
	const isValidMealType = (type: string): type is "ناهار" | "شام" => {
  return type === "ناهار" || type === "شام";
};

const isValidLocation = (location: string): location is "سلف مرکزی" | "سلف یاس" | "خوابگاه حکیمیه" | "خوابگاه خواهران" | "خوابگاه برادران" | "خوابگاه سراج" | "خوابگاه مجیدیه" => {
  const validLocations: string[] = ["سلف مرکزی", "سلف یاس", "خوابگاه حکیمیه", "خوابگاه خواهران", "خوابگاه برادران", "خوابگاه سراج" , "خوابگاه مجیدیه"];
  return validLocations.includes(location);
};

const parseDay = (day: string): "saturday" | "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | undefined => {
  const daysMap: Record<string, "saturday" | "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday"> = {
    "شنبه": "saturday",
    "یکشنبه": "sunday",
    "دوشنبه": "monday",
    "سه‌شنبه": "tuesday",
    "چهارشنبه": "wednesday",
    "پنجشنبه": "thursday",
    "جمعه": "friday",
    "saturday": "saturday",
    "sunday": "sunday",
    "monday": "monday",
    "tuesday": "tuesday",
    "wednesday": "wednesday",
    "thursday": "thursday",
    "friday": "friday"
  };
  return daysMap[day];
};
	type Day = "saturday" | "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday";

	const dayValues: Day[] = [
		"saturday",
		"sunday",
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
	];

	useEffect(() => {
		const fetchFoodItems = async () => {
			try {
				setLoading(true);
				
				const nameFilter = searchQuery;
				
				const response = await getFoodPosts(
					serializeSearch && serializeSearch(['mealType', 'location', 'day', 'name'])
				);

				setFoodItems(response);
				
			} catch (err) {
				setError('خطا در دریافت اطلاعات غذاها');
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchFoodItems();
	}, [filterDependencies]); // Depend on the filterDependencies object

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
			<FoodFilters />
			<FoodPostFeed items={foodItems} />
		</div>
	);
};

export default FoodPage;