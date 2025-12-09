import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './page/Login';
import Register from './page/Register';
import Dashboard from './page/Dashboard';
import Send from './page/Send';
import Receive from './page/Receive'; 
const isAuth = () => !!localStorage.getItem('token');

function PrivateRoute({ children }) {
  return isAuth() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
      <Route path="/send" element={<PrivateRoute><Send/></PrivateRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/receive" element={<PrivateRoute><Receive/></PrivateRoute>} />
    </Routes>
  );
}