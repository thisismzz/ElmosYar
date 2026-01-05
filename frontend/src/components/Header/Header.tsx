import React, { useState, useEffect } from 'react';
import { Search, Menu, X } from 'lucide-react';
import logo from "../../assets/logo.svg";
import './Header.css';
import { useFilters } from '../../contexts/FilterContext';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
	onHomeClick: () => void;
	onToggleSidebar: (isOpen: boolean) => void;
}

type SidebarToggleButtonProps = {
	isOpen: boolean;
	onClick: () => void;
};

export function SidebarToggleButton({
	isOpen,
	onClick,
}: SidebarToggleButtonProps) {
	return (
		<button
			onClick={(e) => {
				e.stopPropagation(); // prevents click-through
				onClick();
			}}
			aria-label="Toggle sidebar"
			className="relative flex h-10 w-10 items-center justify-center rounded-xl

                 transition hover:bg-neutral-50
                 focus:outline-none focus:ring-4 focus:ring-[#16519F]/15"
		>
			<span className="sr-only">Toggle sidebar</span>

			{/* Middle container */}
			<div className="relative h-4 w-5">
				{/* Top line */}
				<span
					className={`
            absolute left-0 top-0 h-[2px] w-full rounded-full bg-neutral-900
            transition-all duration-300 ease-in-out
            ${isOpen ? "top-1/2 rotate-45" : ""}
          `}
				/>

				{/* Middle line */}
				<span
					className={`
            absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 rounded-full bg-neutral-900
            transition-all duration-200 ease-in-out
            ${isOpen ? "opacity-0" : "opacity-100"}
          `}
				/>

				{/* Bottom line */}
				<span
					className={`
            absolute left-0 bottom-0 h-[2px] w-full rounded-full bg-neutral-900
            transition-all duration-300 ease-in-out
            ${isOpen ? "top-1/2 -rotate-45" : ""}
          `}
				/>
			</div>
		</button>
	);
}

const Header: React.FC<HeaderProps> = ({ onHomeClick, onToggleSidebar }) => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const { getFilter, updateFilter } = useFilters();
	const location = useLocation();

	// Get current search value from URL
	const urlSearchValue = getFilter('q', '');

	// Local state only for the input field
	const [inputValue, setInputValue] = useState(urlSearchValue);

	// Sync input value when URL changes
	useEffect(() => {
		setInputValue(urlSearchValue);
	}, [urlSearchValue]);

	// Check if we're in a topic route
	const isInTopicRoute = location.pathname.startsWith('/topic');

	const placeholderText = 'جستجو...';

	// Handle form submission - only updates URL
	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		try {
			// Update the URL with the current input value
			updateFilter('q', inputValue);
		} catch (err) {
			console.error('Failed to update filters from header search', err);
		}
	};

	const handleToggleSidebar = () => {
		const newState = !isSidebarOpen;
		setIsSidebarOpen(newState);
		onToggleSidebar(newState);
	};

	// Handle input change - only updates local state
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
	};

	return (
		<>
			{/* Desktop Header - Now absolute */}
			<header className="desktop-header">
				<div className="header-grid">
					<div></div>

					<div className="search-section">
						<form onSubmit={handleSearch} className="search-form">
							<button type="submit" className="search-icon" disabled={!isInTopicRoute}>
								<Search></Search>
							</button>
							<input
								type="text"
								value={inputValue}
								onChange={handleInputChange}
								placeholder={placeholderText}
								className="search-input"
								dir="rtl"
								disabled={!isInTopicRoute}
							/>
						</form>
					</div>

					<div className='right-section'>
						<div className="logo-section">
							<button
								onClick={onHomeClick}
								className="logo-button"
							>
								<h1 className="site-name">
									علموص‌یار
								</h1>

								<div className="logo-container">
									<img src={logo} alt="Logo" className="logo-icon" />
								</div>
							</button>
						</div>

						<div className="actions-section">
							<SidebarToggleButton
								isOpen={isSidebarOpen}
								onClick={handleToggleSidebar}
							/>
						</div>
					</div>
				</div>
			</header>

			{/* Mobile Header - Now absolute */}
			<header className="mobile-header">
				<div className="mobile-header-content">
					<form onSubmit={handleSearch} className="mobile-search-form">
						<button type="submit" className="mobile-search-icon" disabled={!isInTopicRoute}>
							<Search></Search>
						</button>
						<input
							type="text"
							value={inputValue}
							onChange={handleInputChange}
							placeholder={placeholderText}
							className="mobile-search-input"
							disabled={!isInTopicRoute}
							dir='rtl'
						/>
					</form>
					<button onClick={onHomeClick} className="mobile-logo-button">
						<div className="logo-container">
							<img src={logo} alt="Logo" className="logo-icon" />
						</div>
					</button>
				</div>
			</header>

			{/* Header Spacer - This reserves space for the header */}
			<div className="header-spacer"></div>
		</>
	);
};

export default Header;