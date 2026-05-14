import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useConnect } from 'wagmi'
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import type { Ecosystem } from '../../wallets/useVaultWallet'
import { useVaultWallet } from '../../wallets/useVaultWallet'
import './WalletModal.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  preselect: Ecosystem | null
}

function WalletModal({ isOpen, onClose }: Props) {
  const aptosWallet = useWallet()
  const ethConnect = useConnect()
  const solanaWallet = useSolanaWallet()
  const wallet = useVaultWallet()

  if (!isOpen) return null

  /* ── Aptos: show all detected wallets ── */
  const aptosWallets = aptosWallet.wallets ?? []

  const handleAptosWalletConnect = (walletName: string) => {
    aptosWallet.connect(walletName)
    onClose()
  }

  const handleEthConnect = () => {
    const connector = ethConnect.connectors[0]
    if (connector) {
      ethConnect.connect({ connector })
      onClose()
    }
  }

  const handleSolanaConnect = () => {
    if (solanaWallet.wallets.length > 0) {
      solanaWallet.select(solanaWallet.wallets[0].adapter.name)
      solanaWallet.connect().then(() => onClose()).catch(console.error)
    } else {
      window.open('https://phantom.app/', '_blank')
    }
  }

  // Check if Aptos is already connected
  const isAptosConnected = wallet.aptos.connected

  return (
    <div className="wallet-modal-overlay" onClick={onClose}>
      <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wallet-modal-header">
          <h2>Connect Wallet</h2>
          <button className="wallet-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <p className="wallet-modal-desc">
          Connect your wallet to start storing files on Shelby Protocol.
          <br />
          <span className="wallet-modal-hint">⚡ Recommended: Petra Wallet on Shelbynet</span>
        </p>

        {/* ── Aptos Wallets ── */}
        <div className="wallet-modal-section">
          <div className="wallet-modal-section-title" style={{ color: '#2dd4bf' }}>
            ⬡ Aptos
          </div>
          {isAptosConnected ? (
            <button
              className="wallet-option connected"
              onClick={() => { aptosWallet.disconnect(); }}
            >
              <span className="wallet-option-icon" style={{ color: '#2dd4bf' }}>⬡</span>
              <div className="wallet-option-info">
                <span className="wallet-option-label">{aptosWallet.wallet?.name || 'Aptos'}</span>
                <span className="wallet-option-status">Connected — Tap to disconnect</span>
              </div>
              <span className="wallet-option-dot" />
            </button>
          ) : aptosWallets.length > 0 ? (
            aptosWallets.map((w) => (
              <button
                key={w.name}
                className="wallet-option"
                onClick={() => handleAptosWalletConnect(w.name)}
              >
                {w.icon ? (
                  <img src={w.icon} alt={w.name} className="wallet-option-img" />
                ) : (
                  <span className="wallet-option-icon" style={{ color: '#2dd4bf' }}>⬡</span>
                )}
                <div className="wallet-option-info">
                  <span className="wallet-option-label">{w.name}</span>
                  <span className="wallet-option-status">Connect</span>
                </div>
              </button>
            ))
          ) : (
            <a
              href="https://petra.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="wallet-option wallet-option-install"
            >
              <span className="wallet-option-icon" style={{ color: '#2dd4bf' }}>⬡</span>
              <div className="wallet-option-info">
                <span className="wallet-option-label">Install Petra Wallet</span>
                <span className="wallet-option-status">Required for Shelby</span>
              </div>
            </a>
          )}
        </div>

        {/* ── Other chains ── */}
        <div className="wallet-modal-section">
          <div className="wallet-modal-section-title" style={{ color: '#627eea' }}>
            ◆ Ethereum
          </div>
          <button
            className={`wallet-option ${wallet.ethereum.connected ? 'connected' : ''}`}
            onClick={wallet.ethereum.connected ? wallet.ethereum.disconnect : handleEthConnect}
          >
            <span className="wallet-option-icon" style={{ color: '#627eea' }}>◆</span>
            <div className="wallet-option-info">
              <span className="wallet-option-label">Ethereum</span>
              <span className="wallet-option-status">
                {wallet.ethereum.connected ? 'Connected' : 'Connect'}
              </span>
            </div>
            {wallet.ethereum.connected && <span className="wallet-option-dot" />}
          </button>
        </div>

        <div className="wallet-modal-section">
          <div className="wallet-modal-section-title" style={{ color: '#9945ff' }}>
            ◎ Solana
          </div>
          <button
            className={`wallet-option ${wallet.solana.connected ? 'connected' : ''}`}
            onClick={wallet.solana.connected ? wallet.solana.disconnect : handleSolanaConnect}
          >
            <span className="wallet-option-icon" style={{ color: '#9945ff' }}>◎</span>
            <div className="wallet-option-info">
              <span className="wallet-option-label">Solana</span>
              <span className="wallet-option-status">
                {wallet.solana.connected ? 'Connected' : 'Connect'}
              </span>
            </div>
            {wallet.solana.connected && <span className="wallet-option-dot" />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default WalletModal
