import { useState } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext.js';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return null;
        try {
            return JSON.parse(storedUser);
        } catch {
            localStorage.removeItem('user');
            localStorage.removeItem('jwtToken');
            return null;
        }
    });
    const [token, setToken] = useState(localStorage.getItem('jwtToken'));

    const login = async (email, password) => {
        const res = await api.post('/api/auth/login', { email, password });
        if (res.data.success) {
            const { token: jwt, userId, email: uEmail, role } = res.data.data;
            localStorage.setItem('jwtToken', jwt);
            localStorage.setItem('user', JSON.stringify({ userId, email: uEmail, role }));
            setToken(jwt);
            setUser({ userId, email: uEmail, role });
            return role;
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};
