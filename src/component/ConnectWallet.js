import React from 'react';
import { useWallet } from '../context/WalletContext';
import '../styles/wallet.css';

const ConnectWallet = () => {
  const { isConnected, connectWallet, disconnectWallet, getShortenedAddress, balance, error } = useWallet();

  return (
    <div className="connect-wallet-container">
      <div className="wallet-section">
        <button 
          className={`btn wallet-btn ${isConnected ? 'btn-success wallet-connected' : 'btn-danger'}`} 
          onClick={isConnected ? disconnectWallet : connectWallet}
          title={isConnected ? "Click to disconnect" : "Connect your MetaMask wallet"}
          style={{ color: '#fff' }} /* Adding inline style as a fallback */
        >
          {isConnected ? (
            <>
              <span className="wallet-icon">💼</span> {getShortenedAddress()}
            </>
          ) : (
            'Connect Wallet'
          )}
        </button>
        
        {isConnected && (
          <div className="balance-display">
            <span className="balance-amount">{balance}</span>
            <span className="balance-symbol">BNB</span>
          </div>
        )}
      </div>
      
      {error && <div className="wallet-error">{error}</div>}
    </div>
  );
};

export default ConnectWallet; 