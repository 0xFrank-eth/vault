import { Link, useLocation } from 'react-router-dom'
import { useVaultWallet } from '../wallets/useVaultWallet'
import { useWalletModal } from '../wallets/WalletModalContext'
import { shortAddress } from '../lib/format'
import './Navbar.css'

function Navbar() {
  const location = useLocation()
  const wallet = useVaultWallet()
  const walletModal = useWalletModal()

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/vault', label: 'My Vault' },
    { path: '/upload', label: 'Upload' },
  ]

  return (
    <nav className="navbar glass">
      <Link to="/" className="navbar-brand">
        <img src="/logo.png" alt="Vault" className="navbar-logo-img" />
        <span className="navbar-title">Vault</span>
      </Link>

      <div className="navbar-links">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`navbar-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <button
        className={`navbar-wallet ${wallet.isAnyConnected ? 'connected' : ''}`}
        onClick={() => walletModal.open()}
        id="connect-wallet-btn"
      >
        {wallet.isAnyConnected ? (
          <>
            <span className="navbar-wallet-dot" />
            {shortAddress(wallet.primaryAddress || '')}
          </>
        ) : (
          'Connect Wallet'
        )}
      </button>
    </nav>
  )
}

export default Navbar
