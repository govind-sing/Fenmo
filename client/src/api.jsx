import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5001/api', // Your backend URL
});

// This automatically adds the JWT token to every request header if it exists
API.interceptors.request.use((req) => {
  const profile = localStorage.getItem('userInfo');
  if (profile) {
    const { token } = JSON.parse(profile);
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;