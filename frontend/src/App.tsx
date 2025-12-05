import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { FilterProvider } from './contexts/FilterContext';
import { useAuth } from './contexts/AuthContext';
import useIsMobile from './hooks/useIsMobile';
import Backdrop from './components/Backdrop/Backdrop';
import { Main } from './pages/Main/main';
import RegisterPage from './pages/Login/login';
import { ProfilePage } from './pages/Profile';
import { EditProfilePage } from './pages/EditProfile';
import { WalletPage } from './pages/Wallet';
import Header from './components/Header/Header';
import DiscussionPage from './pages/Discussion/DiscussionPage';
import FoodPage from './pages/FoodExchange/Food';
import { LeftSidebar, RightSideBar } from './components/SideBars/SideBars';
import { MobileBottomNav } from './components/SideBars/MobileBottomNav';
// import { FoodPostFeed } from './components/Food/Posts/FoodPostFeed';
// import FoodFilters from './components/Food/Filter/FoodFilters';




// PostFeed wrapper components for different routes
const TopicDiscussion: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();

  // Use FoodPage for the 'food' topic
  if (topicId === 'food') return <FoodPage />;
  if (topicId === 'discussion') return <DiscussionPage category={topicId} />;

  // For all other topics, show the general discussion feed.
  return <GeneralDiscussion />;
};

const GeneralDiscussion: React.FC = () => {
  return <DiscussionPage />;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isMobile = useIsMobile();
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(!isMobile);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Prevent body scrolling when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && isLeftSidebarOpen) {
      document.body.classList.add('sidebar-open');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('sidebar-open');
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.classList.remove('sidebar-open');
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isLeftSidebarOpen]);

  // Auto-close left sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsLeftSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Auto-open sidebars on desktop, close on mobile
  useEffect(() => {
    if (isMobile) {
      setIsLeftSidebarOpen(false);
      setIsRightSidebarOpen(false);
    }
    else {
      setIsLeftSidebarOpen(true);
      setIsRightSidebarOpen(false);
    }
  }, [isMobile]);

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleToggleSidebar = (isOpen: boolean) => {
    setIsRightSidebarOpen(isOpen);
  };

  const handleToggleLeftSidebar = () => {
    setIsLeftSidebarOpen(!isLeftSidebarOpen);
  };

  const handleCloseLeftSidebar = () => {
    if (isMobile) {
      setIsLeftSidebarOpen(false);
    }
  };

  const isLoginPage = location.pathname === '/login';

  // Redirect to login if not authenticated and not already on login page
  useEffect(() => {
    if (!isAuthenticated && !isLoginPage) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoginPage, navigate]);

  // Show loading or nothing while checking authentication
  if (!isAuthenticated && !isLoginPage) {
    return (
      <div className="App">
        <div className="loading-container">
          <p>در حال بررسی وضعیت ورود...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {!isLoginPage && isAuthenticated && (
        <>
          <Header 
            onHomeClick={handleHomeClick} 
            onToggleSidebar={handleToggleSidebar} 
          />
          
          <div className="app-content">
            {/* Backdrop for mobile sidebar */}
            {isMobile && (
              <Backdrop 
                isActive={isLeftSidebarOpen}
                onClick={handleCloseLeftSidebar}
              />
            )}
            <LeftSidebar isOpen={isLeftSidebarOpen} />
            <main
              className={[
                'main-content',
                isLeftSidebarOpen ? 'left-open' : 'left-closed',
                isRightSidebarOpen ? 'right-open' : 'right-closed'
              ].join(' ')}
              // Close sidebar when clicking on main content on mobile
              onClick={isMobile && isLeftSidebarOpen ? handleCloseLeftSidebar : undefined}
            >
              {children}
            </main>
            {/* Hide RightSideBar on mobile */}
            {!isMobile && <RightSideBar isOpen={isRightSidebarOpen} />}
          </div>
          {/* Show MobileBottomNav only on mobile */}
          {isMobile && (
            <MobileBottomNav
              isLeftSidebarOpen={isLeftSidebarOpen}
              onLeftSidebarToggle={handleToggleLeftSidebar}
              isDeactivated={isLeftSidebarOpen}
            />
          )}
        </>
      )}
      {isLoginPage && children}
    </div>
  );
};

// Protected Routes wrapper component
const ProtectedRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <Routes>
      <Route path='/' element={<Main />} />
      <Route path='/food' element={<FoodPage />} />
      <Route path='/profile' element={<ProfilePage />} />
      <Route path='/profile/wallet' element={<WalletPage />} />
      <Route path='/profile/edit' element={<EditProfilePage />} />
      
      {/* Legacy routes for backward compatibility */}
      <Route path='/Discussion/PostFeed' element={<GeneralDiscussion />} />
      <Route path='/topic/:topicId' element={<TopicDiscussion />} />
    </Routes>
  );
};

// Public Routes wrapper component
const PublicRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path='/login' element={<RegisterPage />} /> {/* تغییر به حروف کوچک */}
      <Route path="*" element={<Navigate to="/login" replace />} /> {/* تغییر به حروف کوچک */}
    </Routes>
  );
};

// Main App Content that uses authentication
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-loading">
        <p>در حال بررسی وضعیت احراز هویت...</p>
      </div>
    );
  }

  return (
    <AppLayout>
      {isAuthenticated ? <ProtectedRoutes /> : <PublicRoutes />}
    </AppLayout>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <FilterProvider>
          <AppContent />
        </FilterProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;