import {
  AccountAddress,
  Aptos,
  AptosConfig,
} from '@aptos-labs/ts-sdk'
import {
  ShelbyClient,
  generateCommitments,
  createDefaultErasureCodingProvider,
  ShelbyBlobClient,
  expectedTotalChunksets,
  getShelbyBlobExplorerUrl,
} from '@shelby-protocol/sdk/browser'
import { SHELBY_CONFIG } from './shelbyNetwork'
import type { ShelbyMode } from '../types/file'

/* ── Aptos & Shelby clients ── */

const aptosConfig = new AptosConfig({ network: SHELBY_CONFIG.network })
export const shelbyAptosClient = new Aptos(aptosConfig)

const rawApiKey = import.meta.env.VITE_SHELBY_API_KEY as string | undefined
const shelbyApiKey =
  rawApiKey && rawApiKey.trim().length > 0 ? rawApiKey.trim() : undefined

export const shelbyClient = new ShelbyClient({
  network: SHELBY_CONFIG.network,
  ...(shelbyApiKey ? { apiKey: shelbyApiKey } : {}),
})

/* ── Types ── */

export type UploadStage =
  | 'preparing'
  | 'encoding'
  | 'registering'
  | 'uploading'
  | 'complete'

export interface UploadParams {
  file: File
  caption: string
  account: { address: string }
  signAndSubmitTransaction(txn: { data: unknown }): Promise<{ hash: string }>
  onProgress: (stage: UploadStage) => void
}

export interface UploadResult {
  hash: string
  blobName: string
  blobUploaded: boolean
  uploadError?: string
  blobExplorerUrl?: string
  ownerAddress: string
  network: ShelbyMode
}

/* ── Helpers ── */

function generateBlobName(fileName: string, caption: string): string {
  const ext = fileName.includes('.') ? '.' + fileName.split('.').pop() : ''
  const slug = (caption || fileName.replace(/\.[^.]+$/, ''))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)

  const finalSlug = slug || 'file'
  return `vault/${finalSlug}-${Date.now()}${ext}`
}

/* ── Main upload function ── */

export async function uploadToShelby(
  params: UploadParams,
): Promise<UploadResult> {
  const {
    file,
    caption,
    account,
    signAndSubmitTransaction,
    onProgress,
  } = params

  // 1. Prepare — read file into memory
  onProgress('preparing')
  const buffer = await file.arrayBuffer()
  const fileData = new Uint8Array(buffer)
  const blobName = generateBlobName(file.name, caption)

  // 2. Encode — generate erasure coding commitments
  onProgress('encoding')
  const provider = await createDefaultErasureCodingProvider()
  const commitments = await generateCommitments(provider, fileData)

  // 3. Register — write blob commitment to Aptos blockchain
  onProgress('registering')

  // Blob expires in 1 year
  const expirationMicros =
    (Date.now() + 1000 * 60 * 60 * 24 * 365) * 1000

  const accountAddress = AccountAddress.from(account.address)

  const payload = ShelbyBlobClient.createRegisterBlobPayload({
    account: accountAddress,
    blobName,
    blobMerkleRoot: commitments.blob_merkle_root,
    numChunksets: expectedTotalChunksets(commitments.raw_data_size),
    expirationMicros,
    blobSize: commitments.raw_data_size,
    encoding: 0,
  })

  // This triggers the wallet popup for signing
  const tx = await signAndSubmitTransaction({ data: payload })
  await shelbyAptosClient.waitForTransaction({
    transactionHash: tx.hash,
  })

  // 4. Upload — send actual blob data to Shelby RPC storage
  onProgress('uploading')

  let blobUploaded = false
  let uploadError: string | undefined

  try {
    await shelbyClient.rpc.putBlob({
      account: account.address,
      blobName,
      blobData: fileData,
    })
    blobUploaded = true
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('401') || message.includes('Unauthorized')) {
      uploadError =
        'Storage upload rejected by Shelby RPC (401). Check API key.'
    } else if (
      message.includes('not been registered') ||
      message.includes('EBLOB_NOT_FOUND')
    ) {
      uploadError =
        'Blob registration TX did not propagate before upload. Try again.'
    } else {
      uploadError = message || 'Storage upload failed'
    }
    console.error('[shelby] putBlob failed:', err)
  }

  onProgress('complete')

  return {
    hash: tx.hash,
    blobName,
    blobUploaded,
    uploadError,
    ownerAddress: accountAddress.toString(),
    network: SHELBY_CONFIG.mode,
    blobExplorerUrl: blobUploaded
      ? getShelbyBlobExplorerUrl(
          SHELBY_CONFIG.network,
          accountAddress.toString(),
          blobName,
        )
      : undefined,
  }
}

/* ── Explorer URL helpers ── */

/**
 * Returns the Shelby explorer URL for a transaction.
 * Shelby has its own explorer at explorer.shelby.xyz
 */
export function getShelbyTxExplorerUrl(hash: string): string {
  return `https://explorer.shelby.xyz/${SHELBY_CONFIG.shelbyExplorerNetwork}/txn/${hash}`
}

/**
 * Returns the Aptos explorer URL (fallback).
 * Note: Only works if the tx is on standard Aptos testnet, not Shelbynet.
 */
export function getAptosExplorerUrl(hash: string): string {
  return `https://explorer.aptoslabs.com/txn/${hash}?network=${SHELBY_CONFIG.aptosExplorerNetwork}`
}
