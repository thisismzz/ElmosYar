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

  const placeholderText = location.pathname.includes('/food') || location.pathname === '/food'
    ? 'جستجوی غذا'
    : 'جستجو...';

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
              <button type="submit" className="search-icon">
                <Search></Search>
              </button>
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={placeholderText}
                className="search-input"
                dir="rtl"
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
              <button onClick={handleToggleSidebar} className="sidebar-toggle">
                {isSidebarOpen ? <X/> : <Menu/>}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header - Now absolute */}
      <header className="mobile-header">
        <div className="mobile-header-content">
          <form onSubmit={handleSearch} className="mobile-search-form">
            <button type="submit" className="mobile-search-icon">
              <Search></Search>
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={placeholderText}
              className="mobile-search-input"
              dir="rtl" // Added: Right-to-left direction
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