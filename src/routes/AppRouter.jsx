import { useEffect } from 'react';
import { Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import Home from '../pages/Home.jsx';
import DiscoveryGrid from '../pages/DiscoveryGrid.jsx';
import MovieDetails from '../pages/MovieDetails.jsx';
import InteractivePlayer from '../pages/InteractivePlayer.jsx';
import SearchResults from '../pages/Search.jsx';
import MoviesPage from '../pages/MoviesPage.jsx';
import TVShowsPage from '../pages/TVShowsPage.jsx';
import Login from '../pages/Login.jsx';
import Signup from '../pages/Signup.jsx';
import Profile from '../pages/Profile.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import ResetPassword from '../pages/ResetPassword.jsx';
import Watchlist from '../pages/Watchlist.jsx';
import ProtectedRoute from '../components/common/ProtectedRoute.jsx';
import MainLayout from '../components/layout/MainLayout.jsx';

const AppRouter = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const mode = searchParams.get('mode');
        const oobCode = searchParams.get('oobCode');
        
        if (mode === 'resetPassword' && oobCode) {
            navigate(`/reset-password?oobCode=${oobCode}`);
        }
    }, [searchParams, navigate]);

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected Routes Wrapper */}
            <Route element={<ProtectedRoute />}>
                {/* Main Layout Wrapper with Outlet */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/browse/:category" element={<DiscoveryGrid />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/movie/:id" element={<MovieDetails />} />
                    <Route path="/player/:id" element={<InteractivePlayer />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/movies" element={<MoviesPage />} />
                    <Route path="/tv" element={<TVShowsPage />} />
                    <Route path="/watchlist" element={<Watchlist />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default AppRouter;
