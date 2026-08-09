import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import SubmitGrievance from './pages/SubmitGrievance';
import GroDashboard from './pages/GroDashboard'; // New import for Session 5

// Component to protect routes that require authentication and specific roles
function ProtectedRoute({ children, allowedRoles }) {
    // Note: Ensure your AuthContext provides a 'user' object that contains the 'role' property
    const { isAuthenticated, user } = useAuth(); 

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Role-Based Access Control (RBAC) check
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // If a user tries to access a route not meant for their role, redirect them to their correct dashboard
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
        return <Navigate to="/login" replace />;
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
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Smart Redirect for root path based on role */}
            <Route path="/" element={<SmartRedirect />} />

            {/* Citizen Protected Routes */}
            <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['CITIZEN']}>
                    <CitizenDashboard />
                </ProtectedRoute>
            } />
            <Route path="/submit" element={
                <ProtectedRoute allowedRoles={['CITIZEN']}>
                    <SubmitGrievance />
                </ProtectedRoute>
            } />

            {/* GRO Protected Routes */}
            <Route path="/gro-dashboard" element={
                <ProtectedRoute allowedRoles={['GRO']}>
                    <GroDashboard />
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