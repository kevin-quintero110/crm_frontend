const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://tu-backend-en-render.com'  // CAMBIA ESTO CUANDO SUBAS EL BACKEND
  : 'http://localhost:5000';

export default API_URL;