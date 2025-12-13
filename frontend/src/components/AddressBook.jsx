import React, { useState, useEffect } from 'react';
import API from '../api/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function AddressBook() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate(); 

  // Lấy user ID từ localStorage
  const userLocal = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (userLocal) {
      loadContacts();
    }
  }, []);

  const loadContacts = async () => {
    try {
      const res = await API.get(`/user/contacts?userId=${userLocal._id}`);
      setContacts(res.data);
    } catch (err) {
      console.error("Lỗi tải danh bạ:", err);
    }
  };

  const handleQuickSend = (address) => {
    navigate('/send', { state: { prefillAddress: address } });
  };

  const handleAdd = async () => {
    // 1. Validate rỗng
    if (!name || !address) return toast.warning("Vui lòng nhập tên và địa chỉ!");
    
    // 2. Validate định dạng ví ETH
    const isEthAddress = /^0x[a-fA-F0-9]{40}$/.test(address);
    if (!isEthAddress) {
      return toast.error("Địa chỉ ví không hợp lệ! Phải bắt đầu bằng 0x...");
    }

    // --- 3. LOGIC CHẶN TRÙNG LẶP (MỚI) ---
    
    // Kiểm tra trùng Địa chỉ ví (Không phân biệt hoa thường)
    const isAddressExist = contacts.some(c => c.address.toLowerCase() === address.toLowerCase());
    if (isAddressExist) {
        return toast.warning("⚠️ Địa chỉ ví này ĐÃ CÓ trong danh bạ rồi!");
    }

    // Kiểm tra trùng Tên gợi nhớ
    const isNameExist = contacts.some(c => c.name.toLowerCase() === name.toLowerCase());
    if (isNameExist) {
        return toast.warning("⚠️ Tên gợi nhớ này đã được sử dụng!");
    }
    // -------------------------------------
    
    setLoading(true);
    try {
      await API.post('/user/contacts', { 
        userId: userLocal._id, 
        name, 
        address 
      });
      toast.success("✅ Đã lưu vào danh bạ!");
      setName(''); 
      setAddress('');
      loadContacts(); 
    } catch (err) {
      toast.error("Lỗi thêm liên hệ!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm("Bạn muốn xóa người này khỏi danh bạ?")) return;

    try {
      await API.post('/user/contacts/delete', { 
        userId: userLocal._id, 
        contactId 
      });
      toast.success("🗑️ Đã xóa liên hệ");
      loadContacts();
    } catch (err) {
      toast.error("Lỗi xóa!");
    }
  };

  return (
    <div className="section-box" style={{ marginTop: 25 }}>
      <div className="section-header">
        <div className="section-title">📒 Danh bạ ví</div>
      </div>
      
      {/* Form Thêm mới */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 10, marginBottom: 20 }}>
  <input 
    placeholder="Tên (VD: Vợ)" 
    value={name} 
    onChange={e => setName(e.target.value)} 
    style={{ 
      padding: '10px 15px', borderRadius: 10, border: '1px solid var(--border)', 
      background: 'var(--bg-body)', color: 'var(--text-main)', outline: 'none', minWidth: 0
    }}
  />
  <input 
    placeholder="Địa chỉ ví (0x...)" 
    value={address} 
    onChange={e => setAddress(e.target.value)} 
    style={{ 
      padding: '10px 15px', borderRadius: 10, border: '1px solid var(--border)', 
      background: 'var(--bg-body)', color: 'var(--text-main)', outline: 'none', minWidth: 0
    }}
  />
  <button 
    onClick={handleAdd} 
    disabled={loading}
    style={{ 
      padding: '0 20px', background: 'var(--primary)', color: 'white', 
      border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap'
    }}
  >
    {loading ? '...' : 'Lưu'}
  </button>
</div>

      {/* Danh sách hiển thị */}
      <div className="asset-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {contacts.length > 0 ? contacts.map(c => (
          <div key={c._id} className="list-item">
            <div className="item-left">
              <div className="icon-box" style={{ background: '#e0e7ff', color: '#4f46e5', fontWeight: 'bold' }}>
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="item-info">
                <div style={{ fontWeight: 'bold', fontSize: 15 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-sub)', fontFamily: 'monospace' }}>
                  {c.address.slice(0, 6)}...{c.address.slice(-4)}
                </div>
              </div>
            </div>
            
            <div className="item-right" style={{display: 'flex', gap: 10, alignItems: 'center'}}>
                {/* Nút Gửi nhanh */}
                <button 
                    onClick={() => handleQuickSend(c.address)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}
                    title="Gửi tiền cho người này"
                >
                    💸
                </button>

                {/* Nút Copy */}
                <button 
                    onClick={() => {navigator.clipboard.writeText(c.address); toast.info("Đã copy!")}}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
                    title="Copy địa chỉ"
                >
                    📋
                </button>

                {/* Nút Xóa */}
                <button 
                    onClick={() => handleDelete(c._id)} 
                    style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: 14 }}
                    title="Xóa liên hệ"
                >
                    Xóa
                </button>
            </div>
          </div>
        )) : (
          <p style={{ textAlign: 'center', color: 'gray', padding: 20 }}>Chưa có liên hệ nào.</p>
        )}
      </div>
    </div>
  );
}