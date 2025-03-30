import React, { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';

// Create a context for the wallet
export const WalletContext = createContext();

// Custom hook to use the wallet context
export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
  // State variables to track wallet connection status and address
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState('0');

  // Check if MetaMask is installed
  const checkIfWalletIsInstalled = () => {
    if (window.ethereum) {
      return true;
    }
    return false;
  };

  // Connect to MetaMask
  const connectWallet = async () => {
    try {
      if (!checkIfWalletIsInstalled()) {
        setError('Please install MetaMask!');
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await ethersProvider.getNetwork();

      setAccount(accounts[0]);
      setIsConnected(true);
      setProvider(ethersProvider);
      setChainId(network.chainId);
      setError('');

      // Get the balance after connecting
      fetchBalance(accounts[0], ethersProvider);
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      setError('Error connecting to wallet');
    }
  };

  // Fetch BNB balance
  const fetchBalance = async (walletAddress, walletProvider) => {
    if (!walletAddress || !walletProvider) return;
    
    try {
      const balanceWei = await walletProvider.getBalance(walletAddress);
      const balanceEth = ethers.utils.formatEther(balanceWei);
      // Format to 4 decimal places
      const formattedBalance = parseFloat(balanceEth).toFixed(4);
      setBalance(formattedBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('0');
    }
  };

  // Refresh balance
  const refreshBalance = async () => {
    if (account && provider) {
      await fetchBalance(account, provider);
    }
  };

  // Disconnect from wallet
  const disconnectWallet = () => {
    setAccount('');
    setIsConnected(false);
    setProvider(null);
    setChainId(null);
    setBalance('0');
  };

  // Get shortened address display
  const getShortenedAddress = () => {
    if (!account) return '';
    return `${account.slice(0, 6)}...${account.slice(-4)}`;
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          if (provider) {
            fetchBalance(accounts[0], provider);
          }
        } else {
          // User disconnected their wallet
          disconnectWallet();
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      });
    }

    return () => {
      // Clean up listeners when component unmounts
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [provider]);

  // Set up an interval to refresh the balance periodically
  useEffect(() => {
    let interval;
    if (isConnected && account && provider) {
      // Refresh balance immediately and then every 15 seconds
      refreshBalance();
      interval = setInterval(refreshBalance, 15000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected, account, provider]);

  return (
    <WalletContext.Provider
      value={{
        account,
        isConnected,
        provider,
        chainId,
        error,
        balance,
        connectWallet,
        disconnectWallet,
        getShortenedAddress,
        checkIfWalletIsInstalled,
        refreshBalance
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}; 