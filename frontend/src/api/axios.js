import axios from 'axios';

const instance = axios.create({
  // baseURL: 'http://127.0.0.1:5001/',  
  baseURL: 'https://orogenie.onrender.com',
  timeout: 30000,
});

export default instance;
