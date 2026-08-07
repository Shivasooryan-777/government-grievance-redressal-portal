import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('jwtToken'));

    useEffect(() => {
        if (token) {
            const storedUser = localStorage.getItem('user');
            if (storedUser) setUser(JSON.parse(storedUser));
        } else {
            setUser(null);
        }
    }, [token]);

    const login = async (email, password) => {
        const res = await api.post('/api/auth/login', { email, password });
        if (res.data.success) {
            const { token: jwt, userId, email: uEmail, role } = res.data.data;
            localStorage.setItem('jwtToken', jwt);
            localStorage.setItem('user', JSON.stringify({ userId, email: uEmail, role }));
            setToken(jwt);
            setUser({ userId, email: uEmail, role });
            return true;
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

export const useAuth = () => useContext(AuthContext);