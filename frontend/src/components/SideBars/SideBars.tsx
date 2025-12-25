import React, { useState, useEffect, useMemo } from 'react';
import { User, PenSquare, Phone, LogOut, Utensils, Star, MessageSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../services/authService';
import './SideBars.css';
import DiscussionPostForm from '../Discussion/Posts/DiscussionPostForm';

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
  onClick?: () => void;
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
export const RightSideBar: React.FC<SideBarProps> = ({ isOpen = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeNav, setActiveNav] = useState<string>('');

  const [showDiscussionForm, setShowDiscussionForm] = useState(false);
  // const [showFoodForm, setShowFoodForm] = useState(false);
  // const [showTeacherForm, setShowTeacherForm] = useState(false);

  
  const currentPage = () => {
    if (location.pathname.includes('/discussion') || location.pathname.includes('/topic/discussion')) {
      return 'discussion';
    }
    if (location.pathname.includes('/food') || location.pathname.includes('/topic/food')) {
      return 'food';
    }
    if (location.pathname.includes('/professors') || location.pathname.includes('/topic/professors')) {
      return 'teacher';
    }
    return 'other';
  };


  const handleCreatePostClick = () => {
    const page = currentPage();
    
    switch(page) {
      case 'discussion':
        setShowDiscussionForm(true);
		// navigate("/topic/discussion/new");
        break;
      case 'food':
        navigate("/topic/food/new");
       break;
      case 'teacher':
        navigate("/topic/professors/new");
        break;
      default:
        navigate('/discussion');
    }
  };

   const navItems: NavItem[] = [
    { 
      id: 'new-post', 
      label:'ایجاد پست', 
      icon: PenSquare, 
      onClick: handleCreatePostClick
    },
    { 
      id: 'profile', 
      label: 'پروفایل', 
      icon: User, 
      path: '/profile' 
    }
  ];

  function getButtonLabel(): string {
    const page = currentPage();
    switch(page) {
      case 'discussion': return 'ایجاد پست بحث';
      case 'food': return 'اشتراک غذا';
      case 'teacher': return 'نظر درباره استاد';
      default: return 'ایجاد محتوا';
    }
  }

  const handleSubmitPost = async (data: any, type: string) => {
    try {
      console.log(`ارسال پست ${type}:`, data);
      // API call بر اساس type
      // await postService.createPost(type, data);
      
      setShowDiscussionForm(false);
      // setShowFoodForm(false);
      // setShowTeacherForm(false);
    
      window.location.reload();
    } catch (error) {
      console.error('خطا در ارسال پست:', error);
    }
  };


  const computedActiveNav = useActiveNav(navItems, location.pathname);

  useEffect(() => {
    setActiveNav(computedActiveNav);
  }, [computedActiveNav]);

  const handleNavClick = (item: NavItem) => {
    setActiveNav(item.id);
    if (item.path) navigate(item.path);
  };

   return (
    <>
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-panel">
          <SidebarHeader title="منوی اصلی" subtitle="دسترسی سریع" />
          
          <nav className="sidebar-nav">
            {navItems.map((item, index) => (
              <NavItemComponent
                key={item.id}
                item={item}
                isActive={activeNav === item.id}
                onClick={(item) => {
                  if (item.onClick) {
                    item.onClick();
                  } else if (item.path) {
                    navigate(item.path);
                  }
                }}
                showDivider={index < navItems.length - 1}
              />
            ))}
          </nav>
        </div>
      </aside>

      {/* نمایش فرم بر اساس نوع */}
      {showDiscussionForm && (
        <DiscussionPostForm
          onClose={() => setShowDiscussionForm(false)}
          onSubmit={(data) => handleSubmitPost(data, 'discussion')}
        />
      )}
    </>
  );
};

// Left Sidebar Component
export const LeftSidebar: React.FC<LeftSidebarProps> = ({ isOpen = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTopic, setActiveTopic] = useState<string>('');

  const topics: NavItem[] = [
    { id: '1', label: 'تبادل غذا', icon: Utensils, path: '/topic/food' },
    { id: '2', label: 'نظرسنجی اساتید', icon: Star, path: '/topic/professors' },
    { id: '3', label: 'بحث و گفتگو', icon: MessageSquare, path: '/topic/discussion' }
  ];

  // Additional items for contact and logout
  const additionalItems: NavItem[] = [
    { id: 'contact', label: 'تماس و راهنما', icon: Phone, path: '/contact' },
    { id: 'logout', label: 'خروج', icon: LogOut }
  ];

  const allItems = [...topics, ...additionalItems];
  const computedActiveTopic = useActiveNav(allItems, location.pathname);

  useEffect(() => {
    setActiveTopic(computedActiveTopic);
  }, [computedActiveTopic]);

  const handleTopicClick = (topic: NavItem) => {
    setActiveTopic(topic.id);
    if (topic.path) {
      navigate(topic.path);
    } else if (topic.id === 'logout') {
      logout();
    }
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
          
          {/* Additional items section */}
          <div className="additional-items-section">
            <div className="section-divider" />
            {additionalItems.map((item) => (
              <div key={item.id} className="topic-item-wrapper">
                <div className="topic-main-item">
                  <NavItemComponent
                    item={item}
                    isActive={activeTopic === item.id}
                    onClick={handleTopicClick}
                    activeIndicatorClass="topic-active-indicator"
                    itemClass={`topic-item ${item.id === 'logout' ? 'topic-item-logout' : ''}`}
                  />
                </div>
                {item.id !== 'logout' && <div className="topic-divider" />}
              </div>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
};