// src/utils/web3Service.js
import axios from 'axios';
import { ethers } from 'ethers';
import { ERC20_ABI } from './networks';

// 1. Lấy Lịch sử giao dịch (API Scan)
export const fetchTransactionHistory = async (address, networkConfig) => {
  try {
    if (!networkConfig?.apiUrl) return [];
    
    // --- LOGIC MỚI HỖ TRỢ V2 ---
    let url = `${networkConfig.apiUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${networkConfig.apiKey}`;
    
    // Nếu mạng có cấu hình chainIdDecimal (tức là Etherscan V2) -> Thêm tham số chainid
    if (networkConfig.chainIdDecimal) {
      url += `&chainid=${networkConfig.chainIdDecimal}`;
    }
    // ---------------------------
    
    console.log("Calling API:", url); // Log để kiểm tra

    const response = await axios.get(url);
    if (response.data.status === "1") {
      return response.data.result.slice(0, 10);
    }
    return [];
  } catch (error) {
    console.error("Lỗi lấy lịch sử:", error);
    return [];
  }
};

// 2. Lấy thông tin & Số dư Token ERC-20
export const fetchTokenBalance = async (tokenAddress, walletAddress, provider) => {
  try {
    // Tạo Contract Instance
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    
    // Gọi song song 3 lệnh để lấy thông tin
    const [balanceRaw, symbol, decimals] = await Promise.all([
      contract.balanceOf(walletAddress),
      contract.symbol(),
      contract.decimals()
    ]);

    // Format số dư
    const balance = ethers.formatUnits(balanceRaw, decimals);
    
    return {
      symbol,
      balance: parseFloat(balance).toFixed(4),
      address: tokenAddress,
      name: symbol // Tạm lấy symbol làm tên
    };
  } catch (error) {
    console.error("Lỗi lấy token:", error);
    return null;
  }
};

// 3. Chuyển đổi mạng (Switch Network)
export const switchNetwork = async (networkKey, networks) => {
  if (!window.ethereum) return;
  const targetNetwork = networks[networkKey];

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: targetNetwork.chainId }],
    });
  } catch (switchError) {
    // Nếu mạng chưa có trong ví -> Thêm mới
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [targetNetwork],
      });
    }
  }
};