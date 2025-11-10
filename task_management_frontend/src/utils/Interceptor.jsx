import axios from "axios";
import { store } from "../store";
import { logout } from "../store/actions/Auth.action";
import { TOKEN } from "./Constants";

// const BASE_URL = 'https://backend-production-c45e.up.railway.app/api'
// const BASE_URL = 'http://192.168.105.165:5000/api'
const BASE_URL = 'https://10.10.5.108:5000/api'
// const BASE_URL = 'http://192.168.0.111:5000/api'
// const BASE_URL = 'https://6449e930925b.ngrok-free.app/api'

const setupInterceptor = () => {
  axios.defaults.baseURL = BASE_URL;

  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(TOKEN);

      // config.headers['ngrok-skip-browser-warning'] = '69420';
      if (!token) {
        store.dispatch(logout())
      } else {
        config.headers.authorization = `Bearer ${token}`;
        
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axios.interceptors.response.use(
    (response) => {
      const newToken = response?.data?.token;
      if (!response?.data?.isFirstLogin && newToken) {
        localStorage.setItem(TOKEN, newToken);
      }
      return response;
    },
    (error) => {
      if (
        error?.response?.status === 401 ||
        error?.response?.data?.data?.message === 'Session expired.'
      ) {
        localStorage.removeItem(TOKEN);
      }
      return Promise.reject(error);
    }
  );
};

export { setupInterceptor };
