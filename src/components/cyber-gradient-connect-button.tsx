// components/CyberGradientConnectButton.tsx
"use client"

import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import IconConnect from "./icons/icon-connect";

export default function CyberGradientConnectButton() {
  return (
      <RainbowConnectButton.Custom>
        {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
          const ready = mounted && authenticationStatus !== 'loading';
          const connected = ready && account && chain;

          return (
              <div style={{ opacity: ready ? 1 : 0 }} className="transition-opacity">
                {!connected ? (
                    <button
                        onClick={openConnectModal}
                        className="group relative px-4 py-2 rounded-xl font-bold transition-all duration-300 overflow-hidden cursor-pointer"
                        style={{
                          // 渐变边框
                          background: `
                    linear-gradient(#0a0a0f, #0a0a0f) padding-box,
                    linear-gradient(135deg, #00ff9d, #00e0ff, #ff00ff) border-box
                  `,
                          border: '2px solid transparent',
                          color: '#00ff9d',
                        }}
                    >
                      {/* 光晕层 */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                           style={{
                             background: 'radial-gradient(circle at center, rgba(0,255,157,0.2) 0%, transparent 70%)',
                             filter: 'blur(10px)',
                           }}
                      />

                      {/* 扫描线效果 */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                           style={{
                             background: 'linear-gradient(transparent 50%, rgba(0,255,157,0.1) 50%)',
                             backgroundSize: '100% 4px',
                             animation: 'scan-line 2s linear infinite',
                           }}
                      />

                      <span className="relative z-10 flex items-center gap-3">
                          <IconConnect className="w-5 h-5" color="currentColor"/>
                  Connect Wallet
                </span>
                    </button>
                ) : (
                    <div className="flex gap-3">
                      {/* 网络按钮 - 蓝色渐变 */}
                      <button
                          onClick={openChainModal}
                          className="group relative px-4 py-2 rounded-lg font-medium transition-all duration-300 overflow-hidden cursor-pointer"
                          style={{
                            background: `
                      linear-gradient(#0a0a0f, #0a0a0f) padding-box,
                      linear-gradient(135deg, #00e0ff, #9d00ff) border-box
                    `,
                            border: '1px solid transparent',
                            color: '#00e0ff',
                          }}
                      >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                             style={{
                               background: 'radial-gradient(circle at center, rgba(0,224,255,0.2) 0%, transparent 70%)',
                               filter: 'blur(8px)',
                             }}
                        />
                        <span className="relative z-10 flex items-center gap-2">
                    {chain.hasIcon && chain.iconUrl && (
                        <img alt={chain.name} src={chain.iconUrl} className="w-5 h-5" />
                    )}
                          {chain.name}
                  </span>
                      </button>

                      {/* 账户按钮 - 霓虹渐变 */}
                      <button
                          onClick={openAccountModal}
                          className="group relative px-6 py-3 rounded-lg font-bold transition-all duration-300 overflow-hidden cursor-pointer"
                          style={{
                            background: `
                      linear-gradient(#0a0a0f, #0a0a0f) padding-box,
                      linear-gradient(135deg, #00ff9d, #ff00ff) border-box
                    `,
                            border: '1px solid transparent',
                            color: '#00ff9d',
                          }}
                      >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                             style={{
                               background: 'radial-gradient(circle at center, rgba(0,255,157,0.3) 0%, rgba(255,0,255,0.1) 70%)',
                               filter: 'blur(10px)',
                             }}
                        />

                        <span className="relative z-10 flex items-center gap-3">
                    {account.displayBalance && (
                        <span className="text-sm font-normal opacity-90">
                        {account.displayBalance}
                      </span>
                    )}
                          <span className="font-mono">
                      {account.displayName}
                    </span>
                          {account.ensAvatar && (
                              <img src={account.ensAvatar} alt="ENS Avatar" className="w-6 h-6 rounded-full"
                                   style={{ border: '1px solid rgba(0,255,157,0.3)' }} />
                          )}
                  </span>
                      </button>
                    </div>
                )}
              </div>
          );
        }}
      </RainbowConnectButton.Custom>
  );
}