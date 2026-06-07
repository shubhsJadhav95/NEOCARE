import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Logic: Use config.headers to inject the token
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;