import React, { createContext, useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';
import apiClient from '../api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initial load: check storage and cookies
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token') || Cookies.get('access_token');

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await apiClient.post('/api/auth/login', { email, password });

            if (response.data.ok) {
                const { session, user: userData } = response.data;
                const token = session.access_token;

                // Store in both localStorage and Cookies
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));

                // Cookies - usually for cross-domain or persistence beyond tab
                // Secure: true should be used in production
                Cookies.set('access_token', token, { expires: 7 });

                setUser(userData);
                return { ok: true };
            }
            return { ok: false, error: response.data.error || 'Login failed' };

        } catch (error) {
            return {
                ok: false,
                error: error.response?.data?.error || 'Server error connection'
            };
        }

    };

    const signup = async (formData) => {
        try {
            const response = await apiClient.post('/api/auth/signup', formData);
            if (response.data.ok) {
                return { ok: true, mensaje: response.data.mensaje };
            }
            return { ok: false, error: response.data.error || 'Signup failed' };

        } catch (error) {
            return {
                ok: false,
                error: error.response?.data?.error || 'Server error connection'
            };
        }

    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        Cookies.remove('access_token');
        setUser(null);
        // Optional: await apiClient.post('/api/auth/logout');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
