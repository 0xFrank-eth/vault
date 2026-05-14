import { useState, useCallback, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVaultWallet } from '../wallets/useVaultWallet'
import { useWalletModal } from '../wallets/WalletModalContext'
import { saveFile, saveFileBlob } from '../lib/fileStorage'
import { SHELBY_CONFIG, SHELBY_MODE } from '../lib/shelbyNetwork'
import type { StoredFile, SupportedChain } from '../types/file'
import './Upload.css'

function Upload() {
  const wallet = useVaultWallet()
  const walletModal = useWalletModal()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(false)

  // Live preview URL for selected file
  const filePreview = useMemo(() => {
    if (!selectedFile) return null
    if (selectedFile.type.startsWith('image/') || selectedFile.type.startsWith('video/')) {
      return URL.createObjectURL(selectedFile)
    }
    return null
  }, [selectedFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) setSelectedFile(file)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  const getChain = (): SupportedChain => {
    if (wallet.primaryEcosystem === 'ethereum') return 'ETH'
    if (wallet.primaryEcosystem === 'solana') return 'SOL'
    return 'APT'
  }

  const handleUpload = async () => {
    if (!wallet.isAnyConnected) {
      walletModal.open()
      return
    }

    if (!selectedFile) {
      setUploadError('Please select a file first.')
      return
    }

    setUploading(true)
    setUploadError('')

    try {
      // Simulate Shelby upload (in production, use ShelbyBrowserClient)
      // The SDK call would be:
      // const client = new ShelbyBrowserClient({ network: SHELBY_CONFIG.network })
      // const result = await client.uploadBlob(file, { signer })
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const id = `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const blobName = `vault/${id}/${selectedFile.name}`
      const txHash = `0x${Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16),
      ).join('')}`

      const storedFile: StoredFile = {
        id,
        fileName: selectedFile.name,
        fileType: selectedFile.type || 'application/octet-stream',
        fileSize: selectedFile.size,
        blobName,
        caption,
        uploaderAddress: wallet.primaryAddress || '',
        ownerAddress: wallet.primaryAddress || '',
        chain: getChain(),
        txHash,
        blobExplorerUrl: `https://explorer.aptoslabs.com/txn/${txHash}?network=${SHELBY_CONFIG.aptosExplorerNetwork}`,
        uploadedAt: Date.now(),
        network: SHELBY_MODE,
      }

      saveFile(storedFile)
      await saveFileBlob(id, selectedFile)
      setUploadSuccess(true)

      setTimeout(() => {
        navigate('/vault')
      }, 2000)
    } catch (err) {
      console.error(err)
      setUploadError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (!wallet.isAnyConnected) {
    return (
      <div className="upload-page">
        <div className="upload-connect">
          <div className="upload-connect-icon">🔐</div>
          <h2>Connect Your Wallet</h2>
          <p>You need to connect a wallet to upload files to Shelby.</p>
          <button
            className="upload-connect-btn"
            onClick={() => walletModal.open()}
          >
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="upload-page">
      <div className="upload-container">
        <h1 className="upload-title">
          Upload to <span className="gradient-text">Vault</span>
        </h1>
        <p className="upload-desc">
          Your file will be stored on Shelby Protocol's decentralized network.
          Once uploaded, it can never be deleted or censored.
        </p>

        {uploadSuccess ? (
          <div className="upload-success">
            <div className="upload-success-icon">✅</div>
            <h3>Upload Successful!</h3>
            <p>Your file is now stored on Shelby. Redirecting to vault...</p>
          </div>
        ) : (
          <>
            <div
              className={`upload-dropzone ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="upload-input"
                onChange={handleFileSelect}
              />
              {selectedFile ? (
                <div className="upload-selected">
                  {filePreview && selectedFile.type.startsWith('image/') ? (
                    <img src={filePreview} alt="Preview" className="upload-preview-img" />
                  ) : filePreview && selectedFile.type.startsWith('video/') ? (
                    <video src={filePreview} className="upload-preview-video" muted autoPlay loop />
                  ) : (
                    <div className="upload-selected-icon">📄</div>
                  )}
                  <div className="upload-selected-name">{selectedFile.name}</div>
                  <div className="upload-selected-size">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </div>
                  <button
                    className="upload-change-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFile(null)
                    }}
                  >
                    Change file
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <div className="upload-placeholder-icon">☁️</div>
                  <div className="upload-placeholder-text">
                    Drag & drop your file here
                  </div>
                  <div className="upload-placeholder-sub">
                    or click to browse
                  </div>
                </div>
              )}
            </div>

            <div className="upload-field">
              <label className="upload-label">Description (optional)</label>
              <textarea
                className="upload-textarea"
                placeholder="Add a description for your file..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
              />
            </div>

            <div className="upload-info">
              <div className="upload-info-item">
                <span className="upload-info-label">Network</span>
                <span className="upload-info-value">{SHELBY_CONFIG.label}</span>
              </div>
              <div className="upload-info-item">
                <span className="upload-info-label">Chain</span>
                <span className="upload-info-value">{getChain()}</span>
              </div>
              <div className="upload-info-item">
                <span className="upload-info-label">Storage</span>
                <span className="upload-info-value">Shelby Blob</span>
              </div>
            </div>

            {uploadError && (
              <div className="upload-error">{uploadError}</div>
            )}

            <button
              className="upload-submit"
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
            >
              {uploading ? (
                <>
                  <span className="upload-spinner" />
                  Uploading to Shelby...
                </>
              ) : (
                <>Upload to Vault</>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default Upload
