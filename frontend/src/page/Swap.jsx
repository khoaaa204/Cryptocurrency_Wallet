import React from 'react';
import { Link } from 'react-router-dom';

export default function Swap() {
  // URL của Uniswap (Theme Dark cho hợp với web của bạn)
  const uniswapUrl = "https://app.uniswap.org/#/swap?theme=dark";

  return (
    <div className="swap-page-container">
      
      {/* 1. HEADER CỦA TRANG SWAP */}
      <div className="swap-header">
        <h2 className="swap-title">🟦 Hoán đổi Token (DEX)</h2>
        <Link to="/dashboard" className="back-btn">
          Về Dashboard
        </Link>
      </div>

      {/* 2. KHUNG CHỨA UNISWAP (PHẦN QUAN TRỌNG NHẤT) */}
      <div className="uniswap-container">
        <iframe
          title="Uniswap"
          src={uniswapUrl}
          width="100%"
          height="100%"
          style={{
            border: 'none',
            borderRadius: '16px',
            backgroundColor: '#131a2a' // Màu nền trùng với Uniswap dark
          }}
        />
      </div>

    </div>
  );
}