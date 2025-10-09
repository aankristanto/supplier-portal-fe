import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5004/api',
});

var navigateTo;
export const injectNavigate = (nav) => {
    navigateTo = nav;
};

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


api.interceptors.response.use(
    (response) => {
        const newToken = response.headers["x-new-access-token"];
        if (newToken) {
            localStorage.setItem('token', newToken);
        }
        return response;
    },
    (error) => {
        if (error.response.status === 401 || error.response.status === 403) {
            localStorage.removeItem('token');
            if (navigateTo) {
                navigateTo('/login');
            } else {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;