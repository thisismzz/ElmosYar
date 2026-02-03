import React, { useMemo } from 'react';
import './FoodPage.css';
import { FoodItem } from '../../types/food_posts';
import { FoodPostFeed } from '../../components/Food/Posts/FoodPostFeed';
import FoodFilters from '../../components/Food/Filter/FoodFilters';
import { usePosts } from '../../hooks/usePosts';
import type { Post } from '../../types/discussion_posts';
type FilterKey = "day" | "cafeteria" | "meal";
type FilterVal = string;

const translateLocation = {
    "yas": "یاس",
    "dormitory_f": "خوابگاه خواهران",
    "central_m": "مرکزی برادران",
    "rashid": "رشید",
    "hakimieh": "حکیمیه",
    "seraj": "سراج",
    "bagheri": "باقری",
    "farjam": "فرجام",
    "majidieh": "مجیدیه",
    "basij": "بسیج",
}

const fields = [
    {
        key: "day",
        label: "روز",
        placeholder: "همه",
        options: [
            { value: "saturday", label: "شنبه" },
            { value: "sunday", label: "یکشنبه" },
            { value: "monday", label: "دوشنبه" },
            { value: "tuesday", label: "سه شنبه" },
            { value: "wednesday", label: "چهارشنبه" },
            { value: "thursday", label: "پنح شنبه" },
            { value: "friday", label: "جمعه" },
        ],
    },
    {
        key: "location",
        label: "سلف",
        placeholder: "همه",
        options: [
            { value: "yas", label: translateLocation["yas"] },
            { value: "basij", label: translateLocation["basij"] },
            { value: "majidieh", label: translateLocation["majidieh"] },
            { value: "farjam", label: translateLocation["farjam"] },
            { value: "bagheri", label: translateLocation["bagheri"] },
            { value: "seraj", label: translateLocation["seraj"] },
            { value: "hakimieh", label: translateLocation["hakimieh"] },
            { value: "rashid", label: translateLocation["rashid"] },
            { value: "central_m", label: translateLocation["central_m"] },
            { value: "dormitory_f", label: translateLocation["dormitory_f"] },
        ],
    },
    {
        key: "mealType",
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


const mapPostToFoodItem = (post: Post): FoodItem => {
    console.log("mapping to foosd", post);
    return {
    id: post.id,
    name: post.attributes.name,
    mealType: post.attributes.mealType,
    location: post.attributes.location,
    date: post.attributes.date,
    day: post.attributes.day,
    price: post.attributes.price,
    isSoldOut: post.attributes.isSoldOut === "true" || post.attributes.isSoldOut === true,
    sellerUsername: post.user.username,
};};

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
            <FoodPostFeed items={foodItems} />
        </div>
    );
};

export default FoodPage;