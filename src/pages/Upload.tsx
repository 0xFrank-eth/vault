import { useState, useCallback, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useVaultWallet } from '../wallets/useVaultWallet'
import { useWalletModal } from '../wallets/WalletModalContext'
import { saveFile, saveFileBlob } from '../lib/fileStorage'
import { SHELBY_MODE } from '../lib/shelbyNetwork'
import { uploadToShelby, getShelbyTxExplorerUrl, fundWithAPT, fundWithShelbyUSD, type UploadStage } from '../lib/shelbyUpload'
import type { StoredFile, SupportedChain } from '../types/file'
import './Upload.css'

const stageLabels: Record<UploadStage, string> = {
  preparing: '📦 Preparing file...',
  encoding: '🔐 Encoding with erasure coding...',
  registering: '⛓️ Registering on Aptos blockchain...',
  uploading: '☁️ Uploading to Shelby storage...',
  complete: '✅ Complete!',
}

function Upload() {
  const wallet = useVaultWallet()
  const aptosWallet = useWallet()
  const walletModal = useWalletModal()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadStage, setUploadStage] = useState<UploadStage | null>(null)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [funding, setFunding] = useState(false)
  const [fundSuccess, setFundSuccess] = useState('')

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

    // Real on-chain upload requires Aptos wallet
    if (!aptosWallet.connected || !aptosWallet.account?.address) {
      setUploadError('Please connect an Aptos wallet for on-chain upload.')
      return
    }

    setUploading(true)
    setUploadError('')
    setUploadStage(null)

    try {
      const result = await uploadToShelby({
        file: selectedFile,
        caption,
        account: { address: String(aptosWallet.account.address) },
        signAndSubmitTransaction: aptosWallet.signAndSubmitTransaction,
        onProgress: (stage) => setUploadStage(stage),
      })

      const id = `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

      const storedFile: StoredFile = {
        id,
        fileName: selectedFile.name,
        fileType: selectedFile.type || 'application/octet-stream',
        fileSize: selectedFile.size,
        blobName: result.blobName,
        caption,
        uploaderAddress: result.ownerAddress,
        ownerAddress: result.ownerAddress,
        chain: getChain(),
        txHash: result.hash,
        blobExplorerUrl: result.blobExplorerUrl || getShelbyTxExplorerUrl(result.hash),
        uploadedAt: Date.now(),
        network: SHELBY_MODE,
      }

      saveFile(storedFile)
      await saveFileBlob(id, selectedFile)
      setUploadSuccess(true)

      if (result.uploadError) {
        console.warn('[vault] Blob registered on-chain but storage upload had issues:', result.uploadError)
      }

      setTimeout(() => {
        navigate('/vault')
      }, 2500)
    } catch (err) {
      console.error(err)
      setUploadError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleFundAccount = async () => {
    if (!aptosWallet.connected || !aptosWallet.account?.address) {
      setUploadError('Please connect an Aptos wallet first.')
      return
    }

    setFunding(true)
    setUploadError('')
    setFundSuccess('')

    try {
      const addr = String(aptosWallet.account.address)
      await fundWithAPT(addr)
      await fundWithShelbyUSD(addr)
      setFundSuccess('✅ Funded! You received 1 APT + 1 ShelbyUSD on Shelbynet.')
    } catch (err) {
      console.error('[faucet]', err)
      const msg = err instanceof Error ? err.message : String(err)
      setUploadError(`Faucet error: ${msg}`)
    } finally {
      setFunding(false)
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
                <span className="upload-info-value">Shelby Testnet</span>
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

            {fundSuccess && (
              <div className="upload-fund-success">{fundSuccess}</div>
            )}

            {/* Faucet section */}
            {aptosWallet.connected && (
              <div className="upload-faucet">
                <div className="upload-faucet-text">
                  🚰 Need Shelbynet tokens?
                </div>
                <button
                  className="upload-faucet-btn"
                  onClick={handleFundAccount}
                  disabled={funding}
                >
                  {funding ? (
                    <><span className="upload-spinner" /> Funding...</>
                  ) : (
                    'Get Free APT + ShelbyUSD'
                  )}
                </button>
              </div>
            )}

            <button
              className="upload-submit"
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
            >
              {uploading ? (
                <>
                  <span className="upload-spinner" />
                  {uploadStage ? stageLabels[uploadStage] : 'Uploading...'}
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
