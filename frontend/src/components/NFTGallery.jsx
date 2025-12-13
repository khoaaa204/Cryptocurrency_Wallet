import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function NFTGallery({ address, chainId }) {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ⚠️ KIỂM TRA LẠI API KEY CỦA BẠN (Đảm bảo đúng 100%)
  const ALCHEMY_API_KEY = "TtXHKzvae6p6tvkJ936gc"; 

  useEffect(() => {
    if (address && address !== "Chưa kết nối") {
      fetchNFTs();
    }
  }, [address, chainId]); // Chạy lại khi đổi mạng

  const fetchNFTs = async () => {
    setLoading(true);
    setErrorMsg('');
    setNfts([]);

    try {
      // 1. Xác định URL dựa trên Chain ID từ Dashboard gửi sang
      let networkSubdomain = "eth-mainnet"; // Mặc định là Mainnet

      if (chainId === '0xaa36a7' || chainId === 11155111) {
        networkSubdomain = "eth-sepolia"; // Sepolia
      } else if (chainId === '0x38' || chainId === 56) {
        // Alchemy không hỗ trợ BSC Free, nên nếu chọn BSC sẽ không load được
        setErrorMsg("Alchemy Free không hỗ trợ mạng BSC.");
        setLoading(false);
        return;
      } else if (chainId === '0x89' || chainId === 137) {
        networkSubdomain = "polygon-mainnet"; // Polygon
      }

      // 2. Gọi API
      const url = `https://${networkSubdomain}.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTsForOwner?owner=${address}&withMetadata=true&excludeFilters[]=SPAM&excludeFilters[]=AIRDROPS`;
      
      console.log(`Đang tải NFT từ: ${networkSubdomain}`); // Debug

      const res = await axios.get(url);
      setNfts(res.data.ownedNfts);

    } catch (error) {
      console.error("Lỗi tải NFT:", error);
      // Check lỗi 403
      if (error.response && error.response.status === 403) {
        setErrorMsg("Lỗi 403: API Key sai hoặc không có quyền truy cập mạng này.");
      } else {
        setErrorMsg("Không thể tải NFT.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{textAlign:'center', padding: 20}}>⏳ Đang tải NFT...</div>;
  if (errorMsg) return <div style={{textAlign:'center', padding: 20, color: 'red'}}>{errorMsg}</div>;

  if (nfts.length === 0) {
    return (
      <div style={{textAlign: 'center', padding: 30, color: 'gray', border:'1px dashed #ccc', borderRadius:12}}>
        <div style={{fontSize: 40}}>🖼️</div>
        <p>Không tìm thấy NFT nào.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 15, marginTop: 10 }}>
      {nfts.map((nft, index) => (
        <div key={index} style={{ background: 'var(--bg-card)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
          <div style={{ height: 140, overflow: 'hidden' }}>
            <img 
              src={nft.image?.cachedUrl || nft.image?.originalUrl || "https://via.placeholder.com/150"} 
              alt={nft.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
          <div style={{ padding: 10 }}>
            <div style={{ fontWeight: 'bold', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {nft.name || `#${nft.tokenId}`}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}