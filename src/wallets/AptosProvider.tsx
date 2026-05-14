import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react'
import type { PropsWithChildren } from 'react'

function AptosProvider({ children }: PropsWithChildren) {
  return (
    <AptosWalletAdapterProvider autoConnect={false}>
      {children}
    </AptosWalletAdapterProvider>
  )
}

export default AptosProvider
