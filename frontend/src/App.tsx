import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { useAuth } from './contexts/AuthContext';
import { Main } from './pages/Main/main';
import RegisterPage from './pages/Login/login';
import { ProfilePage } from './pages/Profile';
import { EditProfilePage } from './pages/EditProfile';
import { WalletPage } from './pages/Wallet';
import Header from './components/Header/Header';
import PostFeed from './components/Posts/PostFeed';
import { LeftSidebar, RightSideBar } from './components/SideBars/SideBars';
import { MobileBottomNav } from './components/SideBars/MobileBottomNav';
import Food from './components/Food/Food';

// PostFeed wrapper components for different routes
const TopicPostFeed: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  return <PostFeed category={topicId} />;
};

const UserPostFeed: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  return <PostFeed username={username} />;
};

const GeneralPostFeed: React.FC = () => {
  return <PostFeed />;
};

// Custom hook to check if device is mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

// Backdrop component for mobile sidebar
interface BackdropProps {
  isActive: boolean;
  onClick: () => void;
}

const Backdrop: React.FC<BackdropProps> = ({ isActive, onClick }) => {
  return (
    <div 
      className={`sidebar-backdrop ${isActive ? 'sidebar-backdrop-active' : ''}`}
      onClick={onClick}
    />
  );
};

// Create a wrapper component to handle the layout
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isMobile = useIsMobile();
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(!isMobile);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(!isMobile);
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
    } else {
      setIsLeftSidebarOpen(true);
      setIsRightSidebarOpen(true);
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

  // Check if we're on the login page
  const isLoginPage = location.pathname === '/Login';

  // Redirect to login if not authenticated and not already on login page
  useEffect(() => {
    if (!isAuthenticated && !isLoginPage) {
      navigate('/Login', { replace: true });
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
              className={`main-content`}
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
    // Redirect to login page with return url
    return <Navigate to="/Login" state={{ from: location }} replace />;
  }

  return (
    <Routes>
      <Route path='/' element={<Main />} />
      <Route path='/profile' element={<ProfilePage />} />
      <Route path='/profile/wallet' element={<WalletPage />} />
      <Route path='/profile/edit' element={<EditProfilePage />} />
      
      {/* Post Feed Routes */}
      <Route path='/feed' element={<GeneralPostFeed />} />
      <Route path='/feed/topic/:topicId' element={<TopicPostFeed />} />
      <Route path='/feed/user/:username' element={<UserPostFeed />} />
      
      {/* Legacy routes for backward compatibility */}
      <Route path='/Discussion/PostFeed' element={<GeneralPostFeed />} />
      <Route path='/topic/:topicId' element={<TopicPostFeed />} />
      
      <Route path = '/food' element= {<Food/>}/>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Public Routes wrapper component
const PublicRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path='/Login' element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/Login" replace />} />
    </Routes>
  );
};

// Main App Content that uses authentication
const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <AppLayout>
        {isAuthenticated ? <ProtectedRoutes /> : <PublicRoutes />}
      </AppLayout>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;