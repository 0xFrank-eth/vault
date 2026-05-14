import { Link } from 'react-router-dom'
import { useWalletModal } from '../wallets/WalletModalContext'
import { useVaultWallet } from '../wallets/useVaultWallet'
import './Home.css'

function Home() {
  const walletModal = useWalletModal()
  const wallet = useVaultWallet()

  return (
    <div className="home">
      {/* Ambient background effects */}
      <div className="home-ambient">
        <div className="home-orb home-orb-1" />
        <div className="home-orb home-orb-2" />
        <div className="home-orb home-orb-3" />
      </div>

      {/* Hero Section */}
      <section className="home-hero">
        <img src="/logo.png" alt="Vault" className="home-hero-logo" />
        <div className="home-badge">
          <span className="home-badge-dot" />
          Built on Shelby Protocol · Aptos Network
        </div>
        <h1 className="home-title">
          Your files.<br />
          <span className="gradient-text">Your chain.</span><br />
          Your vault.
        </h1>
        <p className="home-subtitle">
          Decentralized file storage that no one can take down.
          Upload anything — images, documents, videos — and store it
          permanently on Shelby's hot storage network.
        </p>
        <div className="home-cta">
          {wallet.isAnyConnected ? (
            <Link to="/upload" className="home-btn home-btn-primary">
              Upload Files
              <span className="home-btn-arrow">→</span>
            </Link>
          ) : (
            <button
              className="home-btn home-btn-primary"
              onClick={() => walletModal.open()}
            >
              Connect Wallet
              <span className="home-btn-arrow">→</span>
            </button>
          )}
          <Link to="/vault" className="home-btn home-btn-secondary">
            Explore Vault
          </Link>
        </div>
        <div className="home-stats">
          <div className="home-stat">
            <span className="home-stat-value">3</span>
            <span className="home-stat-label">Chains Supported</span>
          </div>
          <div className="home-stat-divider" />
          <div className="home-stat">
            <span className="home-stat-value">∞</span>
            <span className="home-stat-label">File Types</span>
          </div>
          <div className="home-stat-divider" />
          <div className="home-stat">
            <span className="home-stat-value">0%</span>
            <span className="home-stat-label">Censorship</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="home-features" id="features">
        <h2 className="home-section-title">
          Why <span className="gradient-text">Vault</span>?
        </h2>
        <div className="home-features-grid">
          <div className="home-feature-card">
            <div className="home-feature-icon">🔐</div>
            <h3>Unstoppable Storage</h3>
            <p>
              Files stored on Shelby's decentralized network can't be
              deleted, censored, or taken down by any authority.
            </p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>
              Shelby's hot storage delivers cloud-grade speed with
              sub-second reads. No waiting, no buffering.
            </p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon">🌐</div>
            <h3>Multi-Chain</h3>
            <p>
              Connect with Aptos, Ethereum, or Solana. Your wallet is
              your identity — no signups needed.
            </p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon">🔗</div>
            <h3>Shareable Links</h3>
            <p>
              Every file gets a permanent, verifiable link. Share it
              anywhere — it's yours forever.
            </p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon">🛡️</div>
            <h3>On-Chain Proof</h3>
            <p>
              Every upload is recorded on Aptos. Full transparency,
              full verifiability, full ownership.
            </p>
          </div>
          <div className="home-feature-card">
            <div className="home-feature-icon">💎</div>
            <h3>Own Your Data</h3>
            <p>
              No accounts, no T&C, no platform risk. Your private key
              controls everything.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="home-how">
        <h2 className="home-section-title">
          How it <span className="gradient-text">works</span>
        </h2>
        <div className="home-steps">
          <div className="home-step">
            <div className="home-step-number">01</div>
            <h3>Connect</h3>
            <p>Link your Aptos, Ethereum, or Solana wallet.</p>
          </div>
          <div className="home-step-arrow">→</div>
          <div className="home-step">
            <div className="home-step-number">02</div>
            <h3>Upload</h3>
            <p>Drag & drop any file. Shelby stores it on-chain.</p>
          </div>
          <div className="home-step-arrow">→</div>
          <div className="home-step">
            <div className="home-step-number">03</div>
            <h3>Share</h3>
            <p>Get a permanent link. Your file lives forever.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-brand">
          <img src="/logo.png" alt="Vault" className="home-footer-logo" />
          <span>Vault</span>
        </div>
        <p className="home-footer-text">
          Decentralized file storage on Shelby Protocol.
        </p>
        <div className="home-footer-links">
          <a href="https://shelby.xyz" target="_blank" rel="noopener noreferrer">Shelby</a>
          <a href="https://aptoslabs.com" target="_blank" rel="noopener noreferrer">Aptos</a>
          <a href="https://docs.shelby.xyz" target="_blank" rel="noopener noreferrer">Docs</a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
        <p className="home-footer-copy">
          © 2026 Vault. Built with 💜 on Shelby Protocol.
        </p>
      </footer>
    </div>
  )
}

export default Home
