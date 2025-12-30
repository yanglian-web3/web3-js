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
import { http, Transport } from 'viem';
import { localNetRequestAddress, sepoliaNetRequestAddress } from '@/src/constants/net-address';

// wagmi.config.ts
const isDevelopment = process.env.NODE_ENV === 'development';

// 定义 transports 类型
type TransportsConfig = Record<number, Transport>;

const getTransports = (): TransportsConfig => {

  const commonHttp = {
    [sepolia.id]: http(sepoliaNetRequestAddress),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  }
  if (isDevelopment) {
    return {
      [hardhat.id]: http(localNetRequestAddress),
      ...commonHttp
    };
  } else {
    return commonHttp;
  }
};

export const config = getDefaultConfig({
  appName: 'w3-wallet',
  projectId: 'c05ef50f0a865030879bb99e19e9917a',
  chains: isDevelopment
      ? [hardhat, sepolia]
      : [mainnet, polygon, optimism, arbitrum, base],
  transports: getTransports(),
  ssr: true,
});

export const defaultChainId: number = isDevelopment
    ? hardhat.id
    : mainnet.id;