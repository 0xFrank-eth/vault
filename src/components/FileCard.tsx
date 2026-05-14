import type { StoredFile } from '../types/file'
import { formatFileSize, timeAgo } from '../lib/format'
import { getFileIcon, isPreviewable, getShelbyBlobUrl, networkOf } from '../lib/fileStorage'
import './FileCard.css'

interface Props {
  file: StoredFile
  onDelete?: (id: string) => void
}

const chainBadge: Record<string, { label: string; color: string }> = {
  APT: { label: 'Aptos', color: '#2dd4bf' },
  ETH: { label: 'Ethereum', color: '#627eea' },
  SOL: { label: 'Solana', color: '#9945ff' },
}

function FileCard({ file, onDelete }: Props) {
  const icon = getFileIcon(file.fileType)
  const badge = chainBadge[file.chain] || { label: file.chain, color: '#888' }
  const previewUrl = isPreviewable(file.fileType)
    ? getShelbyBlobUrl(networkOf(file), file.ownerAddress, file.blobName)
    : null

  const handleExplorer = () => {
    if (file.blobExplorerUrl) {
      window.open(file.blobExplorerUrl, '_blank')
    }
  }

  const handleCopyLink = () => {
    const url = getShelbyBlobUrl(networkOf(file), file.ownerAddress, file.blobName)
    navigator.clipboard.writeText(url).catch(console.error)
  }

  return (
    <div className="file-card">
      <div className="file-card-preview">
        {previewUrl && file.fileType.startsWith('image/') ? (
          <img src={previewUrl} alt={file.fileName} className="file-card-image" />
        ) : previewUrl && file.fileType.startsWith('video/') ? (
          <video src={previewUrl} className="file-card-video" muted />
        ) : (
          <div className="file-card-icon-large">{icon}</div>
        )}
        <div className="file-card-chain-badge" style={{ background: badge.color }}>
          {badge.label}
        </div>
      </div>
      <div className="file-card-body">
        <div className="file-card-name" title={file.fileName}>
          {icon} {file.fileName}
        </div>
        {file.caption && (
          <div className="file-card-caption">{file.caption}</div>
        )}
        <div className="file-card-meta">
          <span>{formatFileSize(file.fileSize)}</span>
          <span>·</span>
          <span>{timeAgo(file.uploadedAt)}</span>
        </div>
        <div className="file-card-actions">
          <button className="file-card-btn" onClick={handleCopyLink} title="Copy link">
            🔗
          </button>
          <button className="file-card-btn" onClick={handleExplorer} title="View on explorer">
            🔍
          </button>
          {onDelete && (
            <button
              className="file-card-btn file-card-btn-danger"
              onClick={() => onDelete(file.id)}
              title="Delete"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default FileCard
