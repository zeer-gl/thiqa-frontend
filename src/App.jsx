import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Layout
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';

// Pages
import Home from './pages/Home';
import ProjectOffers from './pages/ProjectOffers';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Payment from './pages/Payment';
import Checkout from './pages/Checkout';
import OrderRequest from './pages/OrderRequest';
import ServiceRequestcompanies from './pages/ServiceRequestcompanies';
import Login from "./pages/auth/Login.jsx";
import LoginSP from "./pages/auth/LoginSP.jsx";
import Signup from "./pages/auth/Signup.jsx";
import ServiceList from './pages/ServiceList';
import ServiceDetail from './pages/ServiceDetail';
import ServiceRequest from './pages/ServiceRequest';
import ProductShowcase from './pages/ProductShowcase';
import Contact from './pages/Contact';
import FAQ from './pages/faq.jsx';
import ServiceRequestView from './pages/ServiceRequestView.jsx';
import ContractorView from './pages/ContractorView';
import FatorahSuccess from './pages/FatorahSuccess';
import FatorahError from './pages/FatorahError';
import PaymentResult from './pages/PaymentResult';

import ProfilePage from './pages/Profile.jsx';
import ProfileSP from './pages/ProfileSP.jsx';
import ProfileRedirect from './components/ProfileRedirect.jsx';
import OrderDetails from './pages/OrderDetails.jsx';
import SignupSP from "./pages/auth/SignupSP.jsx";
import PaymentSuccess from './pages/PaymentSuccess.jsx';
import PriceRequestSuccess from './pages/PriceRequestSuccess.jsx';
import RequestQuoteList from './pages/RequestQuoteList.jsx';
import ForgetPassword from './pages/auth/ForgetPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import PersonalProfile from './pages/PersonalProfile.jsx';

// Components
import PageTitle from './components/PageTitle';
import AuthWrapper from './components/AuthWrapper';
import RoleBasedWrapper from './components/RoleBasedWrapper';

// Styles
import './css/global/global.scss';
import './css/utilities.scss';
import './css/rtl.scss';
import './css/pages/service-request-view.scss';
import './css/pages/contractor-view.scss';
import './css/pages/personal-profile.scss';
import './css/components/loading-screen.scss';

function AppContent() {
    const { i18n } = useTranslation();
    const location = useLocation();
    const [isAppInitialized, setIsAppInitialized] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        const direction = i18n.language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.dir = direction;
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);

    // Check authentication status immediately
    useEffect(() => {
        const checkAuthStatus = () => {
            try {
                const token = localStorage.getItem('token');
                const tokenSP = localStorage.getItem('token-sp');
                const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
                const hasValidAuth = !!((token || tokenSP) && isLoggedIn);
                
                const authRoutes = ['/login', '/login-sp', '/signup', '/signup-sp', '/forget-password', '/reset-password'];
                const isAuthRoute = authRoutes.some(route => location.pathname.startsWith(route));
                
                // If on auth route, allow immediate access
                if (isAuthRoute) {
                    setAuthChecked(true);
                    setIsAppInitialized(true);
                } else {
                    // For protected routes, check authentication first
                    setAuthChecked(true);
                    // Small delay to ensure smooth transition
                    setTimeout(() => {
                        setIsAppInitialized(true);
                    }, 100);
                }
            } catch (error) {
                console.error('Error checking auth:', error);
                setAuthChecked(true);
                setIsAppInitialized(true);
            }
        };

        checkAuthStatus();
    }, [location.pathname]);

    // Define paths that should not show Navbar and Footer
    const hideLayoutOn = ['/login', '/login-sp', '/signup', '/signup-sp', '/forget-password', '/reset-password'];
    const hideLayout = hideLayoutOn.includes(location.pathname);

    // Define auth routes that don't need authentication wrapper
    const authRoutes = ['/login', '/login-sp', '/signup', '/signup-sp', '/forget-password', '/reset-password'];
    const isAuthRoute = authRoutes.includes(location.pathname);

    // Show loading screen while app is initializing or auth is being checked
    if (!isAppInitialized || !authChecked) {
        return (
            <div className="loading-screen">
                <div className="loading-content">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageTitle />
            <div className="App">
                {!hideLayout && <Navbar />}
                <main className="main-content">
                    <Routes>
                        {/* Auth routes - accessible without authentication */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/login-sp" element={<LoginSP />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/signup-sp" element={<SignupSP />}/>
                        <Route path="/forget-password" element={<ForgetPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />

                        {/* Public routes - accessible without authentication */}
                        <Route path="/" element={<Home />} />
                        
                        {/* Protected routes - require authentication */}
                        <Route path="/offers" element={
                            <AuthWrapper>
                                <ProjectOffers />
                            </AuthWrapper>
                        } />
                        <Route path="/products" element={
                            <AuthWrapper>
                                <ProductList />
                            </AuthWrapper>
                        } />
                        <Route path="/product/:id" element={
                            <AuthWrapper>
                                <ProductDetail />
                            </AuthWrapper>
                        } />
                        <Route path="/about" element={
                            <AuthWrapper>
                                <About />
                            </AuthWrapper>
                        } />
                        <Route path="/payment" element={
                            <AuthWrapper>
                                <Payment />
                            </AuthWrapper>
                        } />
                        <Route path="/checkout" element={
                            <AuthWrapper>
                                <Checkout />
                            </AuthWrapper>
                        } />
                        <Route path="/profile" element={
                            <RoleBasedWrapper allowedRoles={['user']}>
                                <ProfilePage />
                            </RoleBasedWrapper>
                        } />
                        <Route path="/profile-redirect" element={
                            <AuthWrapper>
                                <ProfileRedirect />
                            </AuthWrapper>
                        } />
                        <Route path="/profile-sp" element={
                            <RoleBasedWrapper allowedRoles={['sp']}>
                                <ProfileSP />
                            </RoleBasedWrapper>
                        } />
                        <Route path="/order-details/:orderId" element={
                            <AuthWrapper>
                                <OrderDetails />
                            </AuthWrapper>
                        } />
                        <Route path="/request-quote/create" element={
                            <AuthWrapper>
                                <OrderRequest />
                            </AuthWrapper>
                        } />
                        <Route path="/service-request-companies" element={
                            <AuthWrapper>
                                <ServiceRequestcompanies />
                            </AuthWrapper>
                        } />
                        <Route path="/faq" element={
                            <AuthWrapper>
                                <FAQ />
                            </AuthWrapper>
                        } />
                        <Route path="/service-list" element={
                            <AuthWrapper>
                                <ServiceList />
                            </AuthWrapper>
                        } />
                        <Route path="/service/:id" element={
                            <AuthWrapper>
                                <ServiceDetail />
                            </AuthWrapper>
                        } />
                        <Route path="/service-request" element={
                            <AuthWrapper>
                                <ServiceRequest />
                            </AuthWrapper>
                        } />
                        <Route path="/product-showcase" element={
                            <AuthWrapper>
                                <ProductShowcase />
                            </AuthWrapper>
                        } />
                        <Route path="/contact" element={
                            <AuthWrapper>
                                <Contact />
                            </AuthWrapper>
                        } />
                        <Route path="/payment-success" element={
                            <AuthWrapper>
                                <PaymentSuccess />
                            </AuthWrapper>
                        } />
                        <Route path="/fatorah/success" element={
                            <AuthWrapper>
                                <FatorahSuccess />
                            </AuthWrapper>
                        } />
                        <Route path="/fatorah/error" element={
                            <AuthWrapper>
                                <FatorahError />
                            </AuthWrapper>
                        } />
                        <Route path="/payment/result" element={
                            <AuthWrapper>
                                <PaymentResult />
                            </AuthWrapper>
                        } />
                        <Route path="/request-quote/success" element={
                            <AuthWrapper>
                                <PriceRequestSuccess />
                            </AuthWrapper>
                        } />
                        <Route path="/request-quote/list" element={
                            <AuthWrapper>
                                <RequestQuoteList />
                            </AuthWrapper>
                        } />
                        <Route path="/service-request/view" element={
                            <AuthWrapper>
                                <ServiceRequestView />
                            </AuthWrapper>
                        } />
                        <Route path="/contractor/view" element={
                            <AuthWrapper>
                                <ContractorView />
                            </AuthWrapper>
                        } />
                        <Route path="/personal-profile" element={
                            <AuthWrapper>
                                <PersonalProfile />
                            </AuthWrapper>
                        } />
                    </Routes>
                </main>
                {!hideLayout && <Footer />}
            </div>
        </>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
