import React, { useEffect, useState } from 'react';
import API from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      toast.error("Bạn không có quyền truy cập!");
      navigate('/dashboard'); // Đá về trang thường nếu ko phải admin
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác!")) {
      try {
        await API.delete(`/admin/users/${id}`);
        toast.success("Đã xóa user!");
        fetchUsers(); // Load lại danh sách
      } catch (err) {
        toast.error("Lỗi khi xóa user");
      }
    }
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: 50}}>Đang tải dữ liệu Admin...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 style={{color: '#ef4444'}}>🛡️ Admin Panel</h2>
        <Link to="/dashboard" className="logout-btn" style={{textDecoration:'none', background:'#3b82f6', color:'white'}}>
          Về Dashboard
        </Link>
      </div>

      <div className="section-box">
        <div className="section-title">Danh sách người dùng ({users.length})</div>
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: 10}}>
          <thead>
            <tr style={{borderBottom: '2px solid #eee', textAlign: 'left'}}>
              <th style={{padding: 10}}>Email</th>
              <th style={{padding: 10}}>Ví (Address)</th>
              <th style={{padding: 10}}>Vai trò</th>
              <th style={{padding: 10}}>Ngày tạo</th>
              <th style={{padding: 10}}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} style={{borderBottom: '1px solid #eee'}}>
                <td style={{padding: 10}}>{user.email}</td>
                <td style={{padding: 10, fontFamily: 'monospace', fontSize: 12}}>
                  {user.address ? user.address.slice(0, 15) + '...' : 'Chưa có'}
                </td>
                <td style={{padding: 10}}>
                  {user.role === 'admin' 
                    ? <span style={{background: '#fee2e2', color:'red', padding:'3px 8px', borderRadius:5, fontSize:12, fontWeight:'bold'}}>ADMIN</span>
                    : <span style={{background: '#e0e7ff', color:'blue', padding:'3px 8px', borderRadius:5, fontSize:12}}>User</span>
                  }
                </td>
                <td style={{padding: 10, fontSize: 13}}>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td style={{padding: 10}}>
                  {user.role !== 'admin' && (
                    <button 
                      onClick={() => handleDelete(user._id)}
                      style={{background: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: 5, cursor: 'pointer'}}
                    >
                      Xóa
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}