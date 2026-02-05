// Backend API configuration
// Change API_URL based on deployment environment

const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
export const API_URL = import.meta.env.VITE_API_URL || `http://${hostname}:5001`;

export default API_URL;