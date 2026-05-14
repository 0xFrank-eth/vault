export type SupportedChain = 'APT' | 'ETH' | 'SOL'

export interface StoredFile {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  blobName: string
  caption: string
  uploaderAddress: string
  ownerAddress: string
  chain: SupportedChain
  txHash: string
  blobExplorerUrl: string
  uploadedAt: number
  network?: ShelbyMode
}

export type ShelbyMode = 'shelbynet' | 'aptos-testnet'

export interface FileCategory {
  label: string
  icon: string
  extensions: string[]
}
