import { ethers } from "ethers";

export const signMessage = async (message, provider) => {
  // provider: ethers.BrowserProvider
  const signer = await provider.getSigner();
  const signature = await signer.signMessage(message);
  return signature;
};

// helper to convert wei->ether
export const weiToEth = (wei) => {
  try {
    return Number(ethers.formatEther(wei));
  } catch {
    return Number(wei);
  }
};
