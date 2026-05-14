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
