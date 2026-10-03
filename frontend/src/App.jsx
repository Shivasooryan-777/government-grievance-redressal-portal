import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { useAuth } from './context/useAuth';

// Application Pages (Promoted from Stitch Design System)
import CitizenLoginPage from './pages/CitizenLoginPage';
import CitizenRegistrationPage from './pages/CitizenRegistrationPage';
import CitizenDashboardPage from './pages/CitizenDashboardPage';
import SubmitNewGrievancePage from './pages/SubmitNewGrievancePage';
import CitizenGrievanceDetailPage from './pages/CitizenGrievanceDetailPage';
import GroOfficerLoginPage from './pages/GroOfficerLoginPage';
import GroOfficerDashboardPage from './pages/GroOfficerDashboardPage';
import GroTicketDetailPage from './pages/GroTicketDetailPage';
import PublicTrackingStatusPage from './pages/PublicTrackingStatusPage';

// Component to protect routes that require authentication and specific roles
function ProtectedRoute({ children, allowedRoles }) {
    const { isAuthenticated, user } = useAuth(); 

    if (!isAuthenticated) {
        return <Navigate to="/citizen-login" replace />;
    }

    // Role-Based Access Control (RBAC) check
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        if (user.role === 'GRO') {
            return <Navigate to="/gro-dashboard" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

// Component to handle root URL redirection based on the logged-in user's role
function SmartRedirect() {
    const { isAuthenticated, user } = useAuth();
    
    if (!isAuthenticated) {
        return <Navigate to="/citizen-login" replace />;
    }

    if (user?.role === 'GRO') {
        return <Navigate to="/gro-dashboard" replace />;
    }
    
    // Default fallback to citizen dashboard
    return <Navigate to="/dashboard" replace />;
}

// Component to define all application routes
function AppRoutes() {
    return (
        <Routes>
            {/* Root smart redirect based on session & role */}
            <Route path="/" element={<SmartRedirect />} />

            {/* Public Authentication & Registration Routes */}
            <Route path="/citizen-login" element={<CitizenLoginPage />} />
            <Route path="/register" element={<CitizenRegistrationPage />} />
            <Route path="/gro-login" element={<GroOfficerLoginPage />} />

            {/* Public Docket Tracking Route */}
            <Route path="/track" element={<PublicTrackingStatusPage />} />

            {/* Citizen Protected Routes */}
            <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['CITIZEN']}>
                    <CitizenDashboardPage />
                </ProtectedRoute>
            } />

            <Route path="/submit" element={
                <ProtectedRoute allowedRoles={['CITIZEN']}>
                    <SubmitNewGrievancePage />
                </ProtectedRoute>
            } />

            <Route path="/grievance-detail" element={
                <ProtectedRoute allowedRoles={['CITIZEN']}>
                    <CitizenGrievanceDetailPage />
                </ProtectedRoute>
            } />

            {/* GRO Protected Routes */}
            <Route path="/gro-dashboard" element={
                <ProtectedRoute allowedRoles={['GRO']}>
                    <GroOfficerDashboardPage />
                </ProtectedRoute>
            } />
            <Route path="/gro-ticket-detail" element={
                <ProtectedRoute allowedRoles={['GRO']}>
                    <GroTicketDetailPage />
                </ProtectedRoute>
            } />

            {/* Catch-all redirect for unknown/typo routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}