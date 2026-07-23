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
  const [connecting, setConnecting] = useState(false);
  const { updateWallet, user } = useAuth();

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

  // ===== HÀM KẾT NỐI VÍ CHÍNH =====
  // ===== HÀM KẾT NỐI / ĐỔI VÍ =====
  const connectWallet = useCallback(
    async (forceSelect = false) => {
      if (!window.ethereum) {
        alert('Vui lòng cài đặt MetaMask!');
        return;
      }

      setConnecting(true);
      try {
        // 💥 Yêu cầu MetaMask hiện lại bảng chọn tài khoản nếu forceSelect = true
        if (forceSelect) {
          await window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }],
          });
        }

        const prov = new BrowserProvider(window.ethereum);
        // Sau khi cấp quyền/chọn lại, eth_requestAccounts sẽ lấy địa chỉ mới chọn
        const accounts = await prov.send('eth_requestAccounts', []);

        if (accounts.length === 0) {
          throw new Error('Không có tài khoản nào được chọn');
        }

        const network = await prov.getNetwork();
        const currentChainId = Number(network.chainId);
        const sig = await prov.getSigner();
        const selectedAccount = accounts[0];

        setProvider(prov);
        setSigner(sig);
        setAccount(selectedAccount);
        setChainId(currentChainId);
        await fetchBalance(prov, selectedAccount);

        // Lưu địa chỉ ví mới vào CSDL của User hiện tại
        if (user && user._id) {
          try {
            const result = await updateWallet(selectedAccount);
            if (result.success) {
              console.log('✅ Đã lưu ví vào CSDL:', selectedAccount);
            }
          } catch (err) {
            console.warn('Lỗi sync ví với backend:', err.message);
          }
        }

        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', () => window.location.reload());
      } catch (error) {
        console.error('Lỗi kết nối MetaMask:', error);
        if (error.code === 4001) {
          console.log('User từ chối kết nối hoặc từ chối chọn lại ví');
        } else {
          alert('Lỗi kết nối ví: ' + (error.message || 'Không xác định'));
        }
      } finally {
        setConnecting(false);
      }
    },
    [fetchBalance, updateWallet, user]
  );

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

  const handleAccountsChanged = useCallback(
    async (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        const newAccount = accounts[0];
        setAccount(newAccount);
        if (provider) {
          await fetchBalance(provider, newAccount);
        }

        // Sync account mới với backend
        if (user && user._id) {
          try {
            await updateWallet(newAccount);
          } catch (err) {
            console.warn('Sync ví mới thất bại:', err.message);
          }
        }
      }
    },
    [provider, fetchBalance, disconnectWallet, updateWallet, user]
  );

  // Auto reconnect và đồng bộ với ví đã lưu của User
  // Auto reconnect và đồng bộ với ví đã lưu của User
  useEffect(() => {
    const autoConnectSavedWallet = async () => {
      if (!window.ethereum) return;

      try {
        // Lấy danh sách ví đã được cấp quyền trên MetaMask
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });

        if (accounts.length > 0) {
          const prov = new BrowserProvider(window.ethereum);

          // Trường hợp 1: User ĐÃ ĐĂNG NHẬP và CÓ VÍ trong CSDL
          if (user && user.walletAddress) {
            const savedWallet = user.walletAddress.toLowerCase();
            const matchedAccount = accounts.find((acc) => acc.toLowerCase() === savedWallet);

            if (matchedAccount) {
              // ✅ Khớp ví -> Tự động kết nối đúng ví của user này
              const network = await prov.getNetwork();
              const sig = await prov.getSigner(matchedAccount);

              setProvider(prov);
              setSigner(sig);
              setAccount(matchedAccount);
              setChainId(Number(network.chainId));
              await fetchBalance(prov, matchedAccount);
            } else {
              // ❌ Ví trên MetaMask không trùng với ví của user -> Xóa trạng thái ví, không hiển thị nhầm
              console.warn(
                `Ví đã lưu (${user.walletAddress}) chưa được kết nối/chọn trong MetaMask hiện tại.`
              );
              disconnectWallet();
            }
          }
          // Trường hợp 2: User đã đăng nhập nhưng CHƯA CÓ VÍ trong CSDL
          else if (user && !user.walletAddress) {
            disconnectWallet();
          }
        } else {
          disconnectWallet();
        }
      } catch (error) {
        console.error('Lỗi Auto Connect:', error);
      }
    };

    autoConnectSavedWallet();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [user, fetchBalance, disconnectWallet, handleAccountsChanged]);

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
          params: [
            {
              chainId: '0xaa36a7',
              chainName: 'Sepolia Test Network',
              nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://rpc.sepolia.org'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        });
      }
    }
  };

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        account,
        chainId,
        balance,
        connecting,
        connectWallet,
        disconnectWallet,
        isCorrectNetwork,
        switchNetwork,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
