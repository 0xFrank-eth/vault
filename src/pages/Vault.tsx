import { useState, useMemo } from 'react'
import FileCard from '../components/FileCard'
import { getStoredFiles, deleteFile } from '../lib/fileStorage'
import { useVaultWallet } from '../wallets/useVaultWallet'
import { useWalletModal } from '../wallets/WalletModalContext'
import { shortAddress } from '../lib/format'
import type { StoredFile } from '../types/file'
import './Vault.css'

function Vault() {
  const wallet = useVaultWallet()
  const walletModal = useWalletModal()
  const [files, setFiles] = useState<StoredFile[]>(getStoredFiles)
  const [filter, setFilter] = useState<'all' | 'images' | 'documents' | 'other'>('all')

  const filteredFiles = useMemo(() => {
    if (filter === 'all') return files
    if (filter === 'images') return files.filter((f) => f.fileType.startsWith('image/'))
    if (filter === 'documents')
      return files.filter(
        (f) =>
          f.fileType.includes('pdf') ||
          f.fileType.includes('text') ||
          f.fileType.includes('document'),
      )
    return files.filter(
      (f) =>
        !f.fileType.startsWith('image/') &&
        !f.fileType.includes('pdf') &&
        !f.fileType.includes('text'),
    )
  }, [files, filter])

  const handleDelete = (id: string) => {
    deleteFile(id)
    setFiles(getStoredFiles())
  }

  if (!wallet.isAnyConnected) {
    return (
      <div className="vault-page">
        <div className="vault-empty">
          <div className="vault-empty-icon">🔒</div>
          <h2>Your Vault Awaits</h2>
          <p>Connect your wallet to view your stored files.</p>
          <button className="vault-connect-btn" onClick={() => walletModal.open()}>
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="vault-page">
      <div className="vault-container">
        <div className="vault-header">
          <div>
            <h1 className="vault-title">
              My <span className="gradient-text">Vault</span>
            </h1>
            <p className="vault-subtitle">
              {wallet.primaryAddress && shortAddress(wallet.primaryAddress)} ·{' '}
              {files.length} file{files.length !== 1 ? 's' : ''} stored
            </p>
          </div>
          <div className="vault-filters">
            {(['all', 'images', 'documents', 'other'] as const).map((f) => (
              <button
                key={f}
                className={`vault-filter ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredFiles.length === 0 ? (
          <div className="vault-empty-state">
            <div className="vault-empty-state-icon">📂</div>
            <h3>No files yet</h3>
            <p>Upload your first file to see it appear here.</p>
          </div>
        ) : (
          <div className="vault-grid">
            {filteredFiles.map((file, i) => (
              <div key={file.id} style={{ animationDelay: `${i * 0.05}s` }}>
                <FileCard file={file} onDelete={handleDelete} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Vault
