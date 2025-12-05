import React, { useEffect, useState } from 'react';
import './FoodPage.css';
import { FoodItem } from '../../types/food_posts';
import { FoodPostFeed } from '../../components/Food/Posts/FoodPostFeed';
import FoodFilters from '../../components/Food/Filter/FoodFilters';
import { makeSearchQuery, PostSearchQuery, postService } from '../../services/PostService';
import { useFilters } from '../../contexts/FilterContext';
import { FoodPostSearchProps } from '../../types/food_posts';



const FoodPage: React.FC = () => {

	const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { filters, updateFilter, resetFilters } = useFilters();

	const getFoodPosts = async (search_parameters?: PostSearchQuery<FoodPostSearchProps>): Promise<FoodItem[]> => {
		const query_parameters = search_parameters ? JSON.stringify(
			{
				...search_parameters,
				filters: makeSearchQuery(search_parameters.filters),
			}
		) : null;

		const food_posts = await postService.getPosts({
			category: "food",
			search: query_parameters ?? undefined,
		});

		var result: FoodItem[] = [];

		for (var post of food_posts.posts) {
			const post_content_json = JSON.parse(post.content);
			result.push({
				id: post_content_json.id,
				name: post_content_json.name,
				mealType: post_content_json.mealType,
				location: post_content_json.location,
				date: post_content_json.date,
				price: post_content_json.price,
				isSoldOut: post_content_json.isSoldOut,
			})
		}

		return result;
	}

	// temporary, will remove.
	type Day =
		| "saturday"
		| "sunday"
		| "monday"
		| "tuesday"
		| "wednesday"
		| "thursday"
		| "friday";

	const dayValues: Day[] = [
		"saturday",
		"sunday",
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
	];

	function parseDay(value: string): Day | undefined {
		return dayValues.includes(value as Day) ? (value as Day) : undefined;
	}

	useEffect(() => {
		const fetchFoodItems = async () => {
			try {
				setLoading(true);
				const response = await getFoodPosts(
					{
						filters: {
							mealType: filters.mealType == "all" ? undefined : filters.mealType,
							location: filters.location,
							day: filters.day == 'all' ? undefined : parseDay(filters.day),
						},
						search_bar: "", // to be implemented
					}
				);
				setFoodItems(response);

				setFoodItems([]);
			} catch (err) {
				setError('خطا در دریافت اطلاعات غذاها');
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchFoodItems();
	}, [filters]);

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