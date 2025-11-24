import React, { useState } from 'react';
import { Search } from 'lucide-react'; 
import logo from "../../assets/logo.svg";
import './Header.css';

interface HeaderProps {
  onHomeClick: () => void;
  onToggleSidebar: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ onHomeClick, onToggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search query:', searchQuery);
  };

  const handleToggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    onToggleSidebar(newState);
  };

  return (
    <>
      {/* Desktop Header - Now absolute */}
      <header className="desktop-header">
        <div className="header-grid">
          <div></div>
          
          <div className="search-section">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="search-input"
              />
              <button type="submit" className="search-icon">
                <Search></Search>
              </button>
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
                {isSidebarOpen ? '◀' : '▶'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header - Now absolute */}
      <header className="mobile-header">
        <div className="mobile-header-content">
          <form onSubmit={handleSearch} className="mobile-search-form">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="mobile-search-input"
            />
            <button type="submit" className="mobile-search-icon">
              <Search></Search>
            </button>
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