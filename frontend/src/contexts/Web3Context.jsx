import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers, BrowserProvider } from 'ethers';
import { useAuth } from './AuthContext';

const Web3Context = createContext(null);
const TARGET_CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID);

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');
  const { updateWallet } = useAuth();

  const fetchBalance = useCallback(async (prov, addr) => {
    if (!prov || !addr) return;
    try {
      const bal = await prov.getBalance(addr);
      setBalance(ethers.formatEther(bal));
    } catch (err) {
      console.error('Fetch balance error:', err);
      setBalance('0');
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert('Vui lòng cài đặt MetaMask!');
      return;
    }

    try {
      const prov = new BrowserProvider(window.ethereum);
      const accounts = await prov.send('eth_requestAccounts', []);
      const network = await prov.getNetwork();
      const currentChainId = Number(network.chainId);
      const sig = await prov.getSigner();

      setProvider(prov);
      setSigner(sig);
      setAccount(accounts[0]);
      setChainId(currentChainId);
      await fetchBalance(prov, accounts[0]);

      // ⚠️ FIX: Bọc try-catch, nếu updateWallet lỗi thì vẫn tiếp tục
      if (currentChainId === TARGET_CHAIN_ID) {
        try {
          await updateWallet(accounts[0]);
        } catch (err) {
          console.warn('Không sync được ví với backend:', err.message);
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    } catch (error) {
      console.error('Lỗi kết nối MetaMask:', error);
    }
  }, [fetchBalance, updateWallet]);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setBalance('0');
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    }
  }, []);

  const handleAccountsChanged = useCallback(async (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      const newAccount = accounts[0];
      setAccount(newAccount);
      if (provider) {
        await fetchBalance(provider, newAccount);
      }
      // ⚠️ FIX: Khi đổi account, thử sync nhưng không crash nếu lỗi
      try {
        await updateWallet(newAccount);
      } catch (err) {
        console.warn('Sync ví mới thất bại:', err.message);
      }
    }
  }, [provider, fetchBalance, disconnectWallet, updateWallet]);

  // Auto reconnect
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then(async (accounts) => {
        if (accounts.length > 0) {
          const prov = new BrowserProvider(window.ethereum);
          const network = await prov.getNetwork();
          const sig = await prov.getSigner();
          setProvider(prov);
          setSigner(sig);
          setAccount(accounts[0]);
          setChainId(Number(network.chainId));
          await fetchBalance(prov, accounts[0]);
        }
      });
    }
    // Cleanup listeners khi unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [fetchBalance]);

  const isCorrectNetwork = chainId === TARGET_CHAIN_ID;

  const switchNetwork = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xaa36a7',
            chainName: 'Sepolia Test Network',
            nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://rpc.sepolia.org'],
            blockExplorerUrls: ['https://sepolia.etherscan.io']
          }]
        });
      }
    }
  };

  return (
    <Web3Context.Provider value={{
      provider, signer, account, chainId, balance,
      connectWallet, disconnectWallet, isCorrectNetwork, switchNetwork
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);