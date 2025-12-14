import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
  hardhat
} from 'wagmi/chains';
import { http } from 'viem';

export const config = getDefaultConfig({
  appName: 'w3-wallet',
  projectId: 'c05ef50f0a865030879bb99e19e9917a',
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    hardhat,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],
  transports: {
    // ✅ 为所有在主网数组中的链提供配置（即使只是占位符）
    [mainnet.id]: http(), // 使用默认RPC
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    // 替换之前 不可用的 https://rpc.sepolia.org/
    [hardhat.id]: http('http://127.0.0.1:8545'), // ✅ 添加这一行！
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true'
        ? { [sepolia.id]: http('https://sepolia.infura.io/v3/d8ed0bd1de8242d998a1405b6932ab33') }
        : {}
    ),
  },
  ssr: true,
});
export const defaultChainId: number = hardhat.id
