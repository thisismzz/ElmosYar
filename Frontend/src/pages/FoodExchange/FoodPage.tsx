import React, { useEffect, useState } from 'react';
import './FoodPage.css';
import { FoodItem } from '../../types/food_posts';
import { FoodPostFeed } from '../../components/Food/Posts/FoodPostFeed';
import FoodFilters from '../../components/Food/Filter/FoodFilters';
import { makeSearchQueryFromSearchParameters, PostSearchParameters, postService } from '../../services/PostService';
import { useFilters } from '../../contexts/FilterContext';
import { FoodPostSearchProps } from '../../types/food_posts';
import { useSearch } from '../../contexts/SearchContext';



const FoodPage: React.FC = () => {
	const {query, setQuery} = useSearch();

	const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { filters, updateFilter, resetFilters } = useFilters();

	const getFoodPosts = async (search_parameters?: PostSearchParameters<FoodPostSearchProps>): Promise<FoodItem[]> => {
		const query_parameters = search_parameters
      ? (() => {
          const filtersExpr = makeSearchQueryFromSearchParameters(search_parameters);


          const serializeFilters = (obj: Record<string, any>) => {
            const out: Record<string, any> = {};
            for (const k in obj) {
              const v = obj[k];
              if (v instanceof RegExp) out[k] = v.source;
              else out[k] = v;
            }
            return out;
          };

          return JSON.stringify(serializeFilters(filtersExpr));
        })()
      : undefined;

		const food_posts = await postService.getPosts({
			category: "food",
			search: query_parameters,
		});

		var result: FoodItem[] = [];

		for (var post of food_posts.posts) {
			const post_content_json = post.attributes;
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
							name: query == "" ? undefined : query,
							mealType: filters.mealType == "all" ? undefined : filters.mealType,
							location: filters.location == "all" ? undefined : filters.location,
							day: filters.day == 'all' ? undefined : parseDay(filters.day),
						},
						search_bar: "", // to be implemented
					}
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
	}, [filters, query]);

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