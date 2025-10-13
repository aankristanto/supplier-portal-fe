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
        if (config.method === 'get') {
            config.params = {
            ...config.params,
            _t: Date.now(),
            };
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
        const originalRequest = error.config;

        if (error.response) {
            const newToken = error.response.headers["x-new-access-token"];
            if (newToken) {
                localStorage.setItem('token', newToken);
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                 originalRequest._retry = true;
                return api(originalRequest);
            }   
        }
        
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