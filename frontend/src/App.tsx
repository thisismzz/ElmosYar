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
import FoodPage from './pages/FoodExchange/FoodPage';
import VerifyEmail from './pages/VerifyEmail/VerifyEmail';
import NotesPage from './pages/Notes/NotesPage';
import PlannerPage from './pages/Planner/PlannerPage';
import { LeftSidebar, RightSideBar } from './components/SideBars/SideBars';
import { MobileBottomNav } from './components/SideBars/MobileBottomNav';
import TransactionHistoryPage from './pages/TransactionHistory';
import { ReviewPage } from './pages/Professors/Reviews';
import { ProfessorProfilePage } from './pages/Professors/ProfessorProfile';
import ContactUs from './pages/Contact/Contact';
import { CreatePostPage } from './pages/CreatePost/CreatePostPage';


// PostFeed wrapper components for different routes
const TopicDiscussion: React.FC = () => {

	const { topicId } = useParams<{ topicId: string }>();

	// Use FoodPage for the 'food' topic
	if (topicId === 'food') return <FoodPage />;
	if (topicId === 'discussion') return <DiscussionPage category={topicId} />;
	if (topicId === 'professors') return <ReviewPage />;

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

	const isLoginPage = location.pathname === '/login' || location.pathname.startsWith('/verify-email');

	useEffect(() => {
		if (!isAuthenticated && !isLoginPage) {
			navigate('/login', { replace: true });
		}
	}, [isAuthenticated, isLoginPage, navigate]);

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
	const navigate = useNavigate(); //!

	if (!isAuthenticated) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	return (
		<Routes>
			<Route path='/' element={<Main />} />
			<Route path='/notes' element={<NotesPage />} />
			<Route path='/planner' element={<PlannerPage />} />
			<Route path='/login' element={<RegisterPage />} />
			<Route path='/profile' element={<ProfilePage />} />
			<Route path='/profile/wallet' element={<WalletPage />} />
			<Route path='/profile/edit' element={<EditProfilePage />} />
			<Route path='/profile/transactions' element={<TransactionHistoryPage />} />
			<Route path='contactUs' element={<ContactUs />} />
			<Route path='/topic/:topicId' element={<TopicDiscussion />} />
			<Route path='/topic/professors/:professorName' element={<ProfessorProfilePage />} />
			<Route path='/create-post/food' element={<CreatePostPage starting_category='food' />} />
			<Route path='/create-post/review' element={<CreatePostPage starting_category='review' />} />
			<Route path='/create-post/discussion' element={<CreatePostPage starting_category='discussion' />} />
			<Route path='/create-post' element={<CreatePostPage />} />

		</Routes>
	);
};

const PublicRoutes: React.FC = () => {
	return (
		<Routes>
			<Route path='/login' element={<RegisterPage />} />
			<Route path='/verify-email/:token' element={<VerifyEmail />} />
			<Route path="*" element={<Navigate to="/login" replace />} />
		</Routes>
	);
};

// Main App Content that uses authentication
const AppContent: React.FC = () => {
	const { isAuthenticated } = useAuth();


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