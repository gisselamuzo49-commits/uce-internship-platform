// Backend API configuration
// Change API_URL based on deployment environment

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default API_URL;