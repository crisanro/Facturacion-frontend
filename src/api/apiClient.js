import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add the token to every request
apiClient.interceptors.request.use(
    (config) => {
        // Try to get token from localStorage first, then Cookies
        const token = localStorage.getItem('token') || Cookies.get('access_token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor to handle unauthorized errors (401)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Clear storage if unauthorized
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            Cookies.remove('access_token');

            // Optional: window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
