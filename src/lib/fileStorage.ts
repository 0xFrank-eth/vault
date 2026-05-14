import { SHELBY_CONFIGS } from './shelbyNetwork'
import type { ShelbyMode, StoredFile } from '../types/file'

const KEY = 'vault:stored-files'

function safeParse(raw: string | null): StoredFile[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (v): v is StoredFile =>
        v &&
        typeof v === 'object' &&
        typeof v.id === 'string' &&
        typeof v.blobName === 'string' &&
        typeof v.ownerAddress === 'string',
    )
  } catch {
    return []
  }
}

export function getStoredFiles(): StoredFile[] {
  if (typeof window === 'undefined') return []
  return safeParse(window.localStorage.getItem(KEY))
}

export function saveFile(file: StoredFile): void {
  if (typeof window === 'undefined') return
  const existing = getStoredFiles().filter((f) => f.id !== file.id)
  const next = [file, ...existing]
  window.localStorage.setItem(KEY, JSON.stringify(next))
}

export function deleteFile(id: string): void {
  if (typeof window === 'undefined') return
  const next = getStoredFiles().filter((f) => f.id !== id)
  window.localStorage.setItem(KEY, JSON.stringify(next))
  // also clean up the local blob cache
  window.localStorage.removeItem(`vault:blob:${id}`)
}

export function getFilesByOwner(address: string): StoredFile[] {
  const target = address.toLowerCase()
  return getStoredFiles().filter(
    (f) => f.ownerAddress.toLowerCase() === target,
  )
}

export function networkOf(file: StoredFile): ShelbyMode {
  return file.network ?? 'aptos-testnet'
}

export function getShelbyBlobUrl(
  network: ShelbyMode,
  ownerAddress: string,
  blobName: string,
): string {
  const segments = blobName
    .split('/')
    .map((s) => encodeURIComponent(s))
    .join('/')
  return `${SHELBY_CONFIGS[network].shelbyRpcBase}/blobs/${ownerAddress}/${segments}`
}

export function getFileIcon(fileType: string): string {
  if (fileType.startsWith('image/')) return '🖼️'
  if (fileType.startsWith('video/')) return '🎬'
  if (fileType.startsWith('audio/')) return '🎵'
  if (fileType.includes('pdf')) return '📄'
  if (fileType.includes('json') || fileType.includes('javascript') || fileType.includes('typescript')) return '💻'
  if (fileType.includes('text')) return '📝'
  if (fileType.includes('zip') || fileType.includes('tar') || fileType.includes('rar')) return '📦'
  return '📁'
}

export function isPreviewable(fileType: string): boolean {
  return fileType.startsWith('image/') || fileType.startsWith('video/') || fileType.startsWith('audio/')
}

/* ── Local blob storage (base64 data URLs) ── */

const BLOB_PREFIX = 'vault:blob:'

/**
 * Convert a File to a base64 data-URL and store it in localStorage.
 * For large files (>4 MB) we skip local caching to avoid quota errors.
 */
export async function saveFileBlob(id: string, file: File): Promise<void> {
  if (typeof window === 'undefined') return
  if (file.size > 4 * 1024 * 1024) return // skip files > 4 MB
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      try {
        window.localStorage.setItem(`${BLOB_PREFIX}${id}`, reader.result as string)
      } catch {
        // localStorage quota exceeded — silently skip
      }
      resolve()
    }
    reader.readAsDataURL(file)
  })
}

/** Retrieve the base64 data-URL for a stored file, or null. */
export function getFileBlob(id: string): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(`${BLOB_PREFIX}${id}`)
}

/** Remove the local blob cache entry when a file is deleted. */
export function deleteFileBlob(id: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(`${BLOB_PREFIX}${id}`)
}

/**
 * Return the best available preview URL for a stored file:
 * 1. Local base64 cache (instant, works offline)
 * 2. Shelby RPC blob URL (once truly uploaded to the network)
 */
export function getPreviewUrl(file: StoredFile): string | null {
  if (!isPreviewable(file.fileType)) return null
  const local = getFileBlob(file.id)
  if (local) return local
  return getShelbyBlobUrl(networkOf(file), file.ownerAddress, file.blobName)
}
