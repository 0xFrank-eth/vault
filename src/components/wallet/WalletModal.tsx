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

const ecosystemMeta: Record<Ecosystem, { label: string; icon: string; color: string }> = {
  aptos: { label: 'Aptos', icon: '⬡', color: '#2dd4bf' },
  ethereum: { label: 'Ethereum', icon: '◆', color: '#627eea' },
  solana: { label: 'Solana', icon: '◎', color: '#9945ff' },
}

function WalletModal({ isOpen, onClose }: Props) {
  const aptosWallet = useWallet()
  const ethConnect = useConnect()
  const solanaWallet = useSolanaWallet()
  const wallet = useVaultWallet()

  if (!isOpen) return null

  const handleAptosConnect = () => {
    if (aptosWallet.wallets && aptosWallet.wallets.length > 0) {
      const w = aptosWallet.wallets[0]
      aptosWallet.connect(w.name)
      onClose()
    } else {
      window.open('https://petra.app/', '_blank')
    }
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

  const ecosystems: { eco: Ecosystem; connect: () => void }[] = [
    { eco: 'aptos', connect: handleAptosConnect },
    { eco: 'ethereum', connect: handleEthConnect },
    { eco: 'solana', connect: handleSolanaConnect },
  ]

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
        </p>
        <div className="wallet-modal-options">
          {ecosystems.map(({ eco, connect }) => {
            const meta = ecosystemMeta[eco]
            const state = wallet[eco]
            return (
              <button
                key={eco}
                className={`wallet-option ${state.connected ? 'connected' : ''}`}
                onClick={state.connected ? state.disconnect : connect}
              >
                <span className="wallet-option-icon" style={{ color: meta.color }}>
                  {meta.icon}
                </span>
                <div className="wallet-option-info">
                  <span className="wallet-option-label">{meta.label}</span>
                  <span className="wallet-option-status">
                    {state.connected ? 'Connected' : 'Connect'}
                  </span>
                </div>
                {state.connected && <span className="wallet-option-dot" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default WalletModal
