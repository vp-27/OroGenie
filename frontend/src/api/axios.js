import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://127.0.0.1:5001/',  // Your Flask backend URL
  timeout: 30000,
});

export default instance;
