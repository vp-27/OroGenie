import axios from 'axios';

let backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:5001/';
if (backendUrl && !backendUrl.startsWith('http')) {
  backendUrl = `https://${backendUrl}`;
}

const instance = axios.create({
  baseURL: backendUrl,
  timeout: 30000,
});

export default instance;
