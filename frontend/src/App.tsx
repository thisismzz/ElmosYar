import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { useAuth } from './contexts/AuthContext';
import { Main } from './pages/Main/main';
import RegisterPage from './pages/Login/login';
import Header from './components/Header/Header';
import { LeftSidebar, RightSideBar } from './components/SideBars/SideBars';

// Create a wrapper component to handle the layout
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleToggleSidebar = (isOpen: boolean) => {
    setIsSidebarOpen(isOpen);
    console.log('Sidebar is now:', isOpen ? 'Open' : 'Closed');
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
      {/* Only show Header and SideBar when not on login page and authenticated */}
      {!isLoginPage && isAuthenticated && (
        <>
          <Header 
            onHomeClick={handleHomeClick} 
            onToggleSidebar={handleToggleSidebar} 
          />
          <RightSideBar isOpen={isSidebarOpen}/>
          <LeftSidebar isOpen={true} />
        </>
      )}
      {children}
    </div>
  );
};

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/Login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            <Route 
              path='/' 
              element={
                <ProtectedRoute>
                  <Main />
                </ProtectedRoute>
              } 
            />
            <Route path='/Login' element={<RegisterPage />} />
            {/* Fallback route for undefined paths */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;