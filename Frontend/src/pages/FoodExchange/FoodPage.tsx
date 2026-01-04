import React, { useEffect, useState, useMemo } from 'react';
import './FoodPage.css';
import { FoodItem } from '../../types/food_posts';
import { FoodPostFeed } from '../../components/Food/Posts/FoodPostFeed';
import FoodFilters from '../../components/Food/Filter/FoodFilters';
import { postService } from '../../services/PostService';
import { useFilters } from '../../contexts/FilterContext';
import { FoodPostSearchProps } from '../../types/food_posts';
// import { FilterButton, FilterValues, FilterField } from '../../components/FilterButton';
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


const FoodPage: React.FC = () => {
	const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { getFilter, serializeSearch } = useFilters();
	// const [filters, setFilters] = useState<FilterValues<FilterKey, FilterVal>>({});


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
				isSoldOut: post_content_json.isSoldOut,
			});
		}

		return result;
	};

	useEffect(() => {
		const fetchFoodItems = async () => {
			try {
				setLoading(true);

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