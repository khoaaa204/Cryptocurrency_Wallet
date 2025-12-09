import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Đảm bảo port 5000 đúng với backend
});

// --- PHẦN QUAN TRỌNG NHẤT: Tự động gắn Token ---
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token'); // Lấy token từ bộ nhớ
  if (token) {
    // Gắn vào Header: Authorization: Bearer <token>
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});
// ----------------------------------------------

export default API;