import React from 'react';
import { PenSquare, User, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MobileBottomNavProps {
  isLeftSidebarOpen: boolean;
  onLeftSidebarToggle: () => void;
  isDeactivated?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  isLeftSidebarOpen,
  onLeftSidebarToggle,
  isDeactivated = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: 'profile',
      label: 'پروفایل',
      icon: User,
      path: '/profile',
      isActive: location.pathname === '/profile'
    },
    {
      id: 'new-post',
      label: 'پست جدید',
      icon: PenSquare,
      path: '/create-post',
      isActive: location.pathname === '/create-post'
    },
    {
      id: 'menu',
      label: isLeftSidebarOpen ? 'بستن منو' : 'باز کردن منو',
      icon: isLeftSidebarOpen ? X : Menu,
      onClick: onLeftSidebarToggle,
      isActive: false
    }
  ];

  const handleItemClick = (item: any) => {
    if (isDeactivated) return; // Prevent clicks when deactivated
    
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className={`mobile-bottom-nav ${isDeactivated ? 'mobile-bottom-nav-deactivated' : ''}`}>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={`mobile-nav-item ${item.isActive ? 'mobile-nav-item-active' : ''}`}
            disabled={isDeactivated}
          >
            <Icon className="mobile-nav-icon" />
            <span className="mobile-nav-label">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};