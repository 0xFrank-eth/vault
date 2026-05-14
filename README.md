# ◈ Vault — Decentralized File Storage on Shelby

> Your files. Your chain. Your vault.

Vault is a decentralized file storage and sharing application built on **Shelby Protocol** — the high-performance hot storage network on the **Aptos** blockchain.

## 🚀 Features

- **Multi-Chain Wallet Support** — Connect with Aptos, Ethereum (Sepolia), or Solana wallets
- **Decentralized Storage** — Files stored on Shelby's blob storage network
- **Unstoppable** — No censorship, no takedowns, no platform risk
- **File Gallery** — Browse, filter, and manage your uploaded files
- **Shareable Links** — Every file gets a permanent, verifiable URL
- **On-Chain Proof** — Every upload recorded on Aptos blockchain

## 🛠️ Tech Stack

- **Framework**: React + TypeScript + Vite
- **Blockchain**: Aptos (via `@aptos-labs/ts-sdk`)
- **Storage**: Shelby Protocol (`@shelby-protocol/sdk`)
- **Wallets**: Aptos Wallet Adapter, wagmi (EVM), Solana Wallet Adapter
- **Styling**: Vanilla CSS with glassmorphism & gradient design system

## 📦 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
src/
├── main.tsx                  # Entry point with providers
├── App.tsx                   # Router setup
├── index.css                 # Global design system
├── pages/
│   ├── Home.tsx/css          # Landing page
│   ├── Vault.tsx/css         # File gallery
│   └── Upload.tsx/css        # File upload
├── components/
│   ├── Navbar.tsx/css        # Navigation
│   ├── FileCard.tsx/css      # File display card
│   └── wallet/
│       └── WalletModal.tsx/css # Wallet connection
├── wallets/
│   ├── WalletProviders.tsx   # Combined providers
│   ├── AptosProvider.tsx     # Aptos adapter
│   ├── EthereumProvider.tsx  # wagmi/EVM
│   ├── SolanaProvider.tsx    # Solana adapter
│   ├── useVaultWallet.ts     # Unified wallet hook
│   └── WalletModalContext.tsx # Modal state
├── lib/
│   ├── shelbyNetwork.ts      # Shelby config
│   ├── fileStorage.ts        # File persistence
│   └── format.ts             # Utilities
└── types/
    └── file.ts               # Type definitions
```

## 🌐 Environment Variables

```env
VITE_SHELBY_MODE=aptos-testnet  # or "shelbynet"
```

## 🔗 Resources

- [Shelby Protocol](https://shelby.xyz)
- [Shelby Docs](https://docs.shelby.xyz)
- [Aptos](https://aptoslabs.com)
- [Shelby SDK on npm](https://www.npmjs.com/package/@shelby-protocol/sdk)

## 📄 License

MIT
