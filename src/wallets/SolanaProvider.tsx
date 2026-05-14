import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { clusterApiUrl } from '@solana/web3.js'
import type { PropsWithChildren } from 'react'
import { useMemo } from 'react'

function SolanaProvider({ children }: PropsWithChildren) {
  const endpoint = useMemo(() => clusterApiUrl('devnet'), [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect={false}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default SolanaProvider
