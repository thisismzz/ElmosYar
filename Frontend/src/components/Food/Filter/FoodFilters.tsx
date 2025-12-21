// src/components/Food/FoodFilters.tsx
import React, { useState, useRef, useEffect } from 'react';
import './FoodFilters.css';
import { useFilters } from '../../../contexts/FilterContext';
import { ChevronDown } from 'lucide-react';

const FoodFilters: React.FC = () => {
	const { filters, updateFilter } = useFilters();
	const [activeDropdown, setActiveDropdown] = useState<string | null>(null);


	const dropdownRefs = {
		meal: useRef<HTMLDivElement>(null),
		day: useRef<HTMLDivElement>(null),
		location: useRef<HTMLDivElement>(null),
	};

	const mealOptions = [
		{ value: '', label: 'همه وعده‌ها' },
		{ value: 'lunch', label: 'ناهار' },
		{ value: 'dinner', label: 'شام' }
	];

	const dayOptions = [
		{ value: '', label: 'همه روزها' },
		{ value: 'saturday', label: 'شنبه' },
		{ value: 'sunday', label: 'یکشنبه' },
		{ value: 'monday', label: 'دوشنبه' },
		{ value: 'tuesday', label: 'سه‌شنبه' },
		{ value: 'wednesday', label: 'چهارشنبه' },
		{ value: 'thursday', label: 'پنج‌شنبه' }
	];

	const locationOptions = [
		{ value: '', label: 'همه سلف‌ها' },
		{ value: 'yas', label: 'سلف یاس' },
		{ value: 'dormitory_f', label: 'خوابگاه خواهران' },
		{ value: 'central_m', label: 'سلف مرکزی' },
		{ value: 'rashid', label: 'خوابگاه رشید' },
		{ value: 'hakimieh', label: 'خوابگاه حکیمیه' },
		{ value: 'seraj', label: 'خوابگاه سراج' },
		{ value: 'bagheri', label: 'خوابگاه باقری' },
		{ value: 'farjam', label: 'خوابگاه فرجام' },
		{ value: 'majidieh', label: 'خوابگاه مجیدیه' },
		{ value: 'basij', label: 'کوی بسیج' }
	];

	const getSelectedLabel = (type: 'meal' | 'day' | 'location') => {
		const options = type === 'meal' ? mealOptions :
			type === 'day' ? dayOptions : locationOptions;
		const value = type === 'meal' ? filters.mealType :
			type === 'day' ? filters.day : filters.location;

		const selectedOption = options.find(option => option.value === value);
		return selectedOption ? selectedOption.label : options[0].label;
	};

	const toggleDropdown = (type: string) => {
		setActiveDropdown(activeDropdown === type ? null : type);
	};

	const handleSelectOption = (type: 'mealType' | 'day' | 'location', value: string) => {
		updateFilter(type, value);
		setActiveDropdown(null);
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				(dropdownRefs.meal.current && !dropdownRefs.meal.current.contains(event.target as Node)) &&
				(dropdownRefs.day.current && !dropdownRefs.day.current.contains(event.target as Node)) &&
				(dropdownRefs.location.current && !dropdownRefs.location.current.contains(event.target as Node))
			) {
				setActiveDropdown(null);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	return (
		<div className="food-filters-dropdown-container">
			<div className="filters-row">
				{/* filter meal */}
				<div className="filter-dropdown-wrapper" ref={dropdownRefs.meal}>
					<button
						className="filter-dropdown-button"
						onClick={() => toggleDropdown('meal')}
					>
						<span className="filter-button-label">{getSelectedLabel('meal')}</span>
						<ChevronDown size={16} className={`dropdown-icon ${activeDropdown === 'meal' ? 'rotate' : ''}`} />
					</button>

					{activeDropdown === 'meal' && (
						<div className="dropdown-menu">
							{mealOptions.map((option) => (
								<button
									key={option.value}
									className={`dropdown-item ${filters.mealType === option.value ? 'selected' : ''}`}
									onClick={() => handleSelectOption('mealType', option.value)}
								>
									{option.label}
								</button>
							))}
						</div>
					)}
				</div>

				{/* filter day*/}
				<div className="filter-dropdown-wrapper" ref={dropdownRefs.day}>
					<button
						className="filter-dropdown-button"
						onClick={() => toggleDropdown('day')}
					>
						<span className="filter-button-label">{getSelectedLabel('day')}</span>
						<ChevronDown size={16} className={`dropdown-icon ${activeDropdown === 'day' ? 'rotate' : ''}`} />
					</button>

					{activeDropdown === 'day' && (
						<div className="dropdown-menu">
							{dayOptions.map((option) => (
								<button
									key={option.value}
									className={`dropdown-item ${filters.day === option.value ? 'selected' : ''}`}
									onClick={() => handleSelectOption('day', option.value)}
								>
									{option.label}
								</button>
							))}
						</div>
					)}
				</div>

				{/* filter location */}
				<div className="filter-dropdown-wrapper" ref={dropdownRefs.location}>
					<button
						className="filter-dropdown-button"
						onClick={() => toggleDropdown('location')}
					>
						<span className="filter-button-label">{getSelectedLabel('location')}</span>
						<ChevronDown size={16} className={`dropdown-icon ${activeDropdown === 'location' ? 'rotate' : ''}`} />
					</button>

					{activeDropdown === 'location' && (
						<div className="dropdown-menu">
							{locationOptions.map((option) => (
								<button
									key={option.value}
									className={`dropdown-item ${filters.location === option.value ? 'selected' : ''}`}
									onClick={() => handleSelectOption('location', option.value)}
								>
									{option.label}
								</button>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default FoodFilters;