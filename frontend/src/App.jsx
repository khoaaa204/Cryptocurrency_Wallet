import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';


import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AdminDashboard from './page/AdminDashboard';
import Login from './page/Login';
import Register from './page/Register';
import Dashboard from './page/Dashboard';
import Send from './page/Send';
import Receive from './page/Receive'; 
import ForgotPassword from   './page/ForgotPassword';
import ResetPassword from './page/ResetPassword';
import Swap from './page/Swap'; 
const isAuth = () => !!localStorage.getItem('token');

function PrivateRoute({ children }) {
  return isAuth() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      {/* Đặt Container ở đây để hứng mọi thông báo */}
      <ToastContainer position="top-right" autoClose={3000} />

    <Routes>
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
      <Route path="/send" element={<PrivateRoute><Send/></PrivateRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/receive" element={<PrivateRoute><Receive/></PrivateRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/resetpassword/:resetToken" element={<ResetPassword />} />
      <Route path="/admin" element={<PrivateRoute><AdminDashboard/></PrivateRoute>} />
      <Route path="/swap" element={<PrivateRoute><Swap/></PrivateRoute>} />.
    </Routes>
     </>
  );
}