import React, { useState, useEffect, useMemo } from 'react';
import { User, PenSquare, Phone, LogOut, Utensils, Star, MessageSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../services/authService';
import './SideBars.css';

// Types
interface SideBarProps {
  isOpen?: boolean;
}

interface LeftSidebarProps extends SideBarProps {
  onTopicSelect?: (topic: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
}

// Common hook for active navigation
const useActiveNav = (items: NavItem[], currentPath: string) => {
  return useMemo(() => {
    const exactMatch = items.find(item => item.path === currentPath);
    if (exactMatch) return exactMatch.id;

    const partialMatch = items.find(item => 
      item.path && currentPath.startsWith(item.path)
    );
    return partialMatch?.id || '';
  }, [currentPath, items]);
};

// Common sidebar header component
const SidebarHeader: React.FC<{ title: string; subtitle: string }> = ({ 
  title, 
  subtitle 
}) => (
  <div className="sidebar-header">
    <div className="sidebar-header-content">
      <h2 className="sidebar-title">{title}</h2>
      <p className="sidebar-subtitle">{subtitle}</p>
    </div>
    <div className="sidebar-header-decoration">
      <div className="decoration-line"></div>
    </div>
  </div>
);

// Navigation item component
interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  onClick: (item: NavItem) => void;
  showDivider?: boolean;
  activeIndicatorClass?: string;
  itemClass?: string;
}

const NavItemComponent: React.FC<NavItemProps> = ({
  item,
  isActive,
  onClick,
  showDivider = false,
  activeIndicatorClass = "nav-active-indicator",
  itemClass = "nav-item"
}) => {
  const Icon = item.icon;
  
  return (
    <div className="nav-item-wrapper">
      <button
        onClick={() => onClick(item)}
        className={`${itemClass} ${isActive ? `${itemClass}-active` : ''}`}
      >
        {isActive && <div className={activeIndicatorClass} />}
        <span className="nav-label">{item.label}</span>
        <Icon className="nav-icon" />
      </button>
      {showDivider && <div className="nav-divider" />}
    </div>
  );
};

// Right Sidebar Component
export const RightSideBar: React.FC<SideBarProps> = ({ isOpen = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeNav, setActiveNav] = useState<string>('');
  
  const navItems: NavItem[] = [
    { id: 'new-post', label: 'پست جدید', icon: PenSquare, path: '/create-post' },
    { id: 'profile', label: 'پروفایل', icon: User, path: '/profile' },
    { id: 'contact', label: 'تماس و راهنما', icon: Phone, path: '/contact' }
  ];

  const computedActiveNav = useActiveNav(navItems, location.pathname);

  useEffect(() => {
    setActiveNav(computedActiveNav);
  }, [computedActiveNav]);

  const handleNavClick = (item: NavItem) => {
    setActiveNav(item.id);
    if (item.path) navigate(item.path);
  };

  const handleLogout = () => {
    setActiveNav('logout');
    logout();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="sidebar-panel">
        <SidebarHeader title="منوی اصلی" subtitle="دسترسی سريع" />
        
        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            <NavItemComponent
              key={item.id}
              item={item}
              isActive={activeNav === item.id}
              onClick={handleNavClick}
              showDivider={index < navItems.length - 1}
            />
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className={`nav-item ${activeNav === 'logout' ? 'nav-item-active' : 'nav-item-logout'}`}
          >
            {activeNav === 'logout' && <div className="nav-active-indicator" />}
            <span className="nav-label">خروج</span>
            <LogOut className="nav-icon" />
          </button>
        </div>
      </div>
    </aside>
  );
};

// Left Sidebar Component
export const LeftSidebar: React.FC<LeftSidebarProps> = ({ isOpen = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTopic, setActiveTopic] = useState<string>('');

  const topics: NavItem[] = [
    { id: '1', label: 'تبادل غذا', icon: Utensils, path: '/topic/food' },
    { id: '2', label: 'نظرات استادان', icon: Star, path: '/topic/professors' },
    { id: '3', label: 'بحث و گفتگو', icon: MessageSquare, path: '/topic/discussion' }
  ];

  const computedActiveTopic = useActiveNav(topics, location.pathname);

  useEffect(() => {
    setActiveTopic(computedActiveTopic);
  }, [computedActiveTopic]);

  const handleTopicClick = (topic: NavItem) => {
    setActiveTopic(topic.id);
    if (topic.path) navigate(topic.path);
  };

  return (
    <aside className={`left-sidebar ${isOpen ? 'left-sidebar-open' : 'left-sidebar-closed'}`}>
      <div className="left-sidebar-panel">
        <SidebarHeader title="دسته‌بندی‌ها" subtitle="انتخاب موضوع مورد نظر" />
        
        <nav className="sidebar-nav">
          {topics.map((topic) => (
            <div key={topic.id} className="topic-item-wrapper">
              <div className="topic-main-item">
                <NavItemComponent
                  item={topic}
                  isActive={activeTopic === topic.id}
                  onClick={handleTopicClick}
                  activeIndicatorClass="topic-active-indicator"
                  itemClass="topic-item"
                />
              </div>
              <div className="topic-divider" />
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};