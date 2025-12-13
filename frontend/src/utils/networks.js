// src/utils/networks.js
const ETHERSCAN_KEY = "PA227B1WF7D2KD3WHSPNRTM72AWKNQAHW6";

const BSCSCAN_KEY = "YOUR_ETHERSCAN_API_KEY"; 

export const NETWORKS = {
  // --- MẠNG THẬT (MAINNET) ---
  ethereum: {
    chainId: '0x1', // Chain ID: 1
    chainName: 'Ethereum Mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://cloudflare-eth.com'], // RPC công khai
    blockExplorerUrls: ['https://etherscan.io'],
    apiUrl: 'https://api.etherscan.io/api', 
    apiKey: 'PA227B1WF7D2KD3WHSPNRTM72AWKNQAHW6' // Dùng key miễn phí từ etherscan.io
  },
  bsc: {
    chainId: '0x38', // Chain ID: 56
    chainName: 'BNB Smart Chain',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com'],
    apiUrl: 'https://api.bscscan.com/api',
    apiKey: 'YOUR_ETHERSCAN_API_KEY'
  },

  // --- MẠNG THỬ NGHIỆM (TESTNET - GIỮ LẠI ĐỂ TEST) ---
  sepolia: {
    chainId: '0xaa36a7',
    chainName: 'Sepolia Testnet',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
    
    // --- CẤU HÌNH MỚI CHO V2 ---
    apiUrl: 'https://api.etherscan.io/v2/api', // Link V2 dùng chung
    chainIdDecimal: 11155111, // ID mạng dạng số (Bắt buộc cho V2)
    apiKey: 'PA227B1WF7D2KD3WHSPNRTM72AWKNQAHW6' // Key của bạn
  },
  bscTestnet: {
    chainId: '0x61',
    chainName: 'BNB Smart Chain Testnet',
    nativeCurrency: { name: 'BNB', symbol: 'tBNB', decimals: 18 },
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
    blockExplorerUrls: ['https://testnet.bscscan.com'],
    apiUrl: 'https://api-testnet.bscscan.com/api',
    apiKey: 'YOUR_ETHERSCAN_API_KEY'
  }
};

export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];