import React, { useState } from 'react';
import { 
  User, 
  PenSquare,
  Phone, 
  MessageCircle,
  LogOut,
  Utensils,
  Star,
  MessageSquare
  
} from 'lucide-react';
import './SideBars.css';
import { logout } from '../../services/authService';

interface SideBarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNewPost?: () => void;
  onProfile?: () => void;
  onContact?: () => void;
  onLogout?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: () => void;
}

export const RightSideBar: React.FC<SideBarProps> = ({
  isOpen = true,
  onClose,
  onNewPost,
  onProfile,
  onContact,
  onLogout
}) => {
  const [activeNav, setActiveNav] = useState<string>('');

  const navItems: NavItem[] = [
    {
      id: 'new-post',
      label: 'پست جدید',
      icon: PenSquare,
      action: onNewPost
    },
    {
      id: 'profile',
      label: 'پروفایل',
      icon: User,
      action: onProfile
    },
    {
      id: 'contact',
      label: 'تماس و راهنما',
      icon: Phone,
      action: onContact
    }
  ];

  const handleNavClick = (item: NavItem) => {
    setActiveNav(item.id);
    if (item.action) {
      item.action();
    }
  };

  const handleLogout = () => {
    setActiveNav('logout');
    logout()
  };

  if (!isOpen) return null;

  return (
    <aside className="sidebar">
      {/* Panel Container with rounded corners and structure */}
      <div className="sidebar-panel">
        {/* Section Header - Updated to match the image */}
        <div className="sidebar-header">
          <div className="sidebar-header-content">
            <h2 className="sidebar-title">منوی اصلی</h2>
            <p className="sidebar-subtitle">دسترسی سريع</p>
          </div>
          <div className="sidebar-header-decoration">
            <div className="decoration-line"></div>
          </div>
        </div>
        
        {/* Navigation Items */}
        <nav className="sidebar-nav">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            
            return (
              <div key={item.id} className="nav-item-wrapper">
                <button
                  onClick={() => handleNavClick(item)}
                  className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                >
                  {isActive && (
                    <div className="nav-active-indicator"></div>
                  )}
                  <span className="nav-label">{item.label}</span>
                  <Icon className="nav-icon" />
                </button>
                {index < navItems.length - 1 && (
                  <div className="nav-divider"></div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout Section at Bottom */}
        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className={`nav-item ${activeNav === 'logout' ? 'nav-item-active' : 'nav-item-logout'}`}
          >
            {activeNav === 'logout' && (
              <div className="nav-active-indicator"></div>
            )}
            <span className="nav-label">خروج</span>
            <LogOut className="nav-icon" />
          </button>
        </div>
      </div>
    </aside>
  );
};





interface LeftSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onTopicSelect?: (topic: string) => void;
}

interface TopicItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  isOpen = true,
  onClose,
  onTopicSelect
}) => {
  const [activeTopic, setActiveTopic] = useState<string>('');
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set(['1']));

  const topics: TopicItem[] = [
    {
      id: '1',
      label: 'تبادل غذا',
      icon: Utensils
    },
    {
      id: '2',
      label: 'نظرات استادان',
      icon: Star
    },
    {
      id: '3',
      label: 'بحث و گفتگو',
      icon: MessageSquare
    }
  ];

  const handleTopicClick = (topic: TopicItem) => {
    setActiveTopic(topic.id);
    if (onTopicSelect) {
      onTopicSelect(topic.label);
    }
  };

  const toggleTopicExpansion = (topicId: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  if (!isOpen) return null;

  return (
    <aside className="left-sidebar">
      {/* Panel Container with rounded corners and structure */}
      <div className="left-sidebar-panel">
        {/* Section Header - Matching the design */}
        <div className="sidebar-header">
          <div className="sidebar-header-content">
            <h2 className="sidebar-title">دسته‌بندی‌ها</h2>
            <p className="sidebar-subtitle">انتخاب موضوع مورد نظر</p>
          </div>
          <div className="sidebar-header-decoration">
            <div className="decoration-line"></div>
          </div>
        </div>
        
        {/* Topics List */}
        <nav className="sidbar-nav">
          {topics.map((topic) => {
            const IconComponent = topic.icon;
            return (
              <div key={topic.id} className="topic-item-wrapper">
                <div className="topic-main-item">
                  <button
                    onClick={() => handleTopicClick(topic)}
                    className={`topic-item ${activeTopic === topic.id ? 'topic-item-active' : ''}`}
                  >
                    {activeTopic === topic.id && (
                      <div className="topic-active-indicator"></div>
                    )}
                    <span className="nav-label">{topic.label}</span>
                    <IconComponent className="nav-icon" />
                  </button>
                </div>

                <div className="topic-divider"></div>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};