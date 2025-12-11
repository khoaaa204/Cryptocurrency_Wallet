import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers'; // <--- Import thư viện Blockchain
import API from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import './Send.css';
import { toast } from 'react-toastify';

export default function Send() {
  const navigate = useNavigate();
  
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Load theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  // --- LOGIC GỬI TIỀN THẬT (REAL BLOCKCHAIN TRANSACTION) ---
  const handleSend = async (e) => {
    e.preventDefault();

    if (!recipient || !amount) {
      toast.success("Vui long nhap day du thong tin")
      return;
    }

    // Kiểm tra MetaMask có cài không
    if (!window.ethereum) {
      toast.success("Vui lòng cài đặt MetaMask để thực hiện giao dịch!");
      return;
    }

    setLoading(true);

    try {
      // 1. Kết nối với MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner(); // Người ký giao dịch (là bạn)

      // 2. Chuyển đổi số tiền sang đơn vị Wei (Blockchain không hiểu số thập phân)
      // Ví dụ: 1 ETH = 10^18 Wei
      const txAmount = ethers.parseEther(amount.toString());

      console.log("Đang khởi tạo giao dịch...");

      // 3. Gửi lệnh lên Blockchain (MetaMask sẽ bật lên hỏi bạn)
      const tx = await signer.sendTransaction({
        to: recipient,
        value: txAmount,
      });

      console.log("Giao dịch đã được gửi! Hash:", tx.hash);
      
      // 4. Đợi giao dịch được xác nhận (Đào block)
      toast.success("⏳ Giao dịch đã gửi đi. Vui lòng đợi xác nhận...");
      await tx.wait(); // Chờ giao dịch hoàn tất trên blockchain

      // 5. Sau khi thành công trên Blockchain, ta mới lưu vào Database của mình để làm lịch sử
      await API.post('/wallets/transaction', {
        from: await signer.getAddress(),
        to: recipient,
        amount: Number(amount),
        hash: tx.hash, // Lưu mã giao dịch thật
        token: "ETH"   // Hoặc BNB tùy mạng
      });

      toast.success(`✅ Gửi tiền thành công! Hash: ${tx.hash}`);
      navigate('/dashboard');

    } catch (err) {
      console.error("Lỗi giao dịch:", err);
      
      // Xử lý các lỗi thường gặp
      if (err.code === 'ACTION_REJECTED') {
        toast.success("Bạn đã từ chối giao dịch trên MetaMask.");
      } else if (err.code === 'INSUFFICIENT_FUNDS') {
        toast.success("Số dư không đủ để trả tiền + phí Gas!");
      } else {
        toast.success("Giao dịch thất bại: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Các hàm tiện ích (Paste, Max)
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRecipient(text);
    } catch (err) { toast.success("Không thể truy cập clipboard"); }
  };

  const handleMax = () => {
    // Để an toàn, bạn không nên set max 100% vì cần chừa tiền trả phí Gas
    toast.success("Tính năng Max cần tính toán phí Gas (Nâng cao). Hãy nhập tay số tiền nhỏ hơn số dư hiện có.");
  };

  return (
    <div className="send-container">
      <div className="send-card">
        <div className="send-header">
          <h2>Gửi Crypto (REAL)</h2>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        <div className="network-warning" style={{marginBottom: 15, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: 10, borderRadius: 8, fontSize: 13}}>
          ⚠️ <strong>CẢNH BÁO:</strong> Đây là giao dịch thật trên Blockchain. Tiền gửi đi <strong>không thể lấy lại</strong>. Hãy kiểm tra kỹ địa chỉ ví!
        </div>

        <form onSubmit={handleSend}>
          <div className="form-group">
            <label className="form-label">Người nhận</label>
            <div className="input-wrapper">
              <input 
                className="form-input" type="text" placeholder="0x..." 
                value={recipient} onChange={(e) => setRecipient(e.target.value)} required
              />
              <button type="button" className="input-action-btn" onClick={handlePaste}>DÁN</button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Số tiền</label>
            <div className="input-wrapper">
              <input 
                className="form-input" type="number" placeholder="0.00" 
                value={amount} onChange={(e) => setAmount(e.target.value)} step="0.000000000000000001" min="0" required
              />
            </div>
          </div>

          <button className="send-btn" disabled={loading}>
            {loading ? "Đang xử lý trên Blockchain..." : "Xác nhận gửi tiền"}
          </button>
        </form>

        <Link to="/dashboard" className="back-link">← Quay lại Dashboard</Link>
      </div>
    </div>
  );
}