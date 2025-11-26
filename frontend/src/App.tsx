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

// Create a wrapper component to handle the layout
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleToggleSidebar = (isOpen: boolean) => {
    setIsRightSidebarOpen(isOpen);
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
            <LeftSidebar isOpen={isLeftSidebarOpen} />
            <main className={`main-content ${isLeftSidebarOpen ? 'with-left-sidebar' : ''} ${isRightSidebarOpen ? 'with-right-sidebar' : ''}`}>
              {children}
            </main>
            <RightSideBar isOpen={isRightSidebarOpen} />
          </div>
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