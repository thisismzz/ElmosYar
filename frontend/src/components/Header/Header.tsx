import React, { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, ChevronDown } from 'lucide-react';
// import logoSvg from "../../assets/logo.svg";
import Logo from '../LogoComponent';
import './Header.css';
import { useFilters } from '../../contexts/FilterContext';
import { useLocation } from 'react-router-dom';
import { FilterButtonConnected } from '../FilterButtonConnected';

interface HeaderProps {
    onHomeClick: () => void;
    onToggleSidebar: (isOpen: boolean) => void;
}

type SidebarToggleButtonProps = {
    isOpen: boolean;
    onClick: () => void;
};


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

type SearchFilterType = 'general' | 'username' | 'tags';

const Header: React.FC<HeaderProps> = ({ onHomeClick, onToggleSidebar }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchFilter, setSearchFilter] = useState<SearchFilterType>('general');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const desktopDropdownRef = useRef<HTMLDivElement>(null);
    const mobileDropdownRef = useRef<HTMLDivElement>(null);
    const { getFilter, updateFilter, setFilters, filters } = useFilters();
    const location = useLocation();

    // Get current search value from URL based on selected filter
    const getSearchValueForFilter = (filterType: SearchFilterType) => {
        switch (filterType) {
            case 'username':
                return getFilter('username', '');
            case 'tags':
                return getFilter('tags', '');
            default:
                return getFilter('q', '');
        }
    };

    // Local state only for the input field
    const [inputValue, setInputValue] = useState(getSearchValueForFilter(searchFilter));

    // Sync input value when URL or filter type changes
    useEffect(() => {
        setInputValue(getSearchValueForFilter(searchFilter));
    }, [searchFilter, filters]);

    // Check if we're in a topic route
    const isInTopicRoute = location.pathname.startsWith('/topic');

    // Check if we're in the discussion topic specifically
    const isInDiscussionTopic = location.pathname.startsWith('/topic/discussion');
    const isInFoodTopic = location.pathname.startsWith('/topic/food');

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const clickedOutsideDesktop = desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target as Node);
            const clickedOutsideMobile = mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node);

            if (clickedOutsideDesktop && clickedOutsideMobile) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filterLabels: Record<SearchFilterType, string> = {
        general: 'همه',
        username: 'نام کاربری',
        tags: 'برچسب‌ها'
    };

    const placeholderText = `جستجو در ${filterLabels[searchFilter]}...`;

    // Handle form submission - updates appropriate filter based on type
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Build complete filter object with all changes at once
            let newFilters = { ...filters };

            if (searchFilter === 'general') {
                newFilters.username = '';
                newFilters.tags = '';
                newFilters.q = inputValue;
            } else if (searchFilter === 'username') {
                newFilters.q = '';
                newFilters.tags = '';
                newFilters.username = inputValue;
            } else if (searchFilter === 'tags') {
                newFilters.q = '';
                newFilters.username = '';
                newFilters.tags = inputValue;
            }

            // Update all filters at once
            setFilters(newFilters);
        } catch (err) {
            console.error('Failed to update filters from header search', err);
        }
    };

    const handleFilterChange = (newFilter: SearchFilterType) => {
        setSearchFilter(newFilter);
        setIsDropdownOpen(false);
        setInputValue(getSearchValueForFilter(newFilter));
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
                            {isInDiscussionTopic && (
                                <div className="search-filter-dropdown" ref={desktopDropdownRef}>
                                    <button
                                        type="button"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="search-filter-button"
                                    >
                                        <span>{filterLabels[searchFilter]}</span>
                                        <ChevronDown size={16} />
                                    </button>
                                    {isDropdownOpen && (
                                        <div className="search-filter-menu">
                                            {(['general', 'username', 'tags'] as SearchFilterType[]).map((filter) => (
                                                <button
                                                    key={filter}
                                                    type="button"
                                                    onClick={() => handleFilterChange(filter)}
                                                    className={`search-filter-option ${searchFilter === filter ? 'active' : ''}`}
                                                >
                                                    {filterLabels[filter]}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            {isInFoodTopic && (
                                <div className="search-filter-dropdown">
                                    <FilterButtonConnected<K, V>
                                        fields={fields}
                                    />
                                </div>
                            )}
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

                                {/* <div className="logo-container">
                                    <img src={logoSvg} alt="Logo" className="logo-icon" />
                                </div> */}
                                <div className="logo-container">
                                    <Logo></Logo>
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
                        {isInDiscussionTopic && (
                            <div className="mobile-search-filter-dropdown" ref={mobileDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="mobile-search-filter-button"
                                >
                                    <ChevronDown size={16} />
                                </button>
                                {isDropdownOpen && (
                                    <div className="mobile-search-filter-menu">
                                        {(['general', 'username', 'tags'] as SearchFilterType[]).map((filter) => (
                                            <button
                                                key={filter}
                                                type="button"
                                                onClick={() => handleFilterChange(filter)}
                                                className={`mobile-search-filter-option ${searchFilter === filter ? 'active' : ''}`}
                                            >
                                                {filterLabels[filter]}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </form>
                    <button onClick={onHomeClick} className="mobile-logo-button">
                        {/* <div className="logo-container">
                            <img src={logoSvg} alt="Logo" className="logo-icon" />
                        </div> */}
                        <div className="logo-container">
                            <Logo></Logo>
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