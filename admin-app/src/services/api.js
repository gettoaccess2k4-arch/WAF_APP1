import axios from 'axios';

const api = axios.create({ baseURL: '/api', withCredentials: true });

api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.data?.code === 'TOKEN_EXPIRED' && !err.config._retry) {
      err.config._retry = true;
      await axios.post('/api/auth/refresh', {}, { withCredentials: true });
      return api(err.config);
    }
    return Promise.reject(err);
  }
);

export default api;
