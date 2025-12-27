import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:5001/',
  timeout: 30000,
});

export default instance;
