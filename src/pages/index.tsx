import type { NextPage } from 'next';
import ScanStarAnimations from "../components/dashboard/scan-star-animations";
import PureSVGHalo from "../components/dashboard/pure-svg-halo";
import CyberCard from "../components/card/cyber-card";
import CyberGradientConnectButton from "../components/cyber-gradient-connect-button";
import IconLogo from "../components/icons/icon-logo";

const Dashboard: NextPage = () => {

  /**
   * 获取渲染内容布局
   */
  const getContent = () => {
    return <CyberCard className="flex flex-col justify-center w-10/12 lg:w-[800px] xl:w-[1000px] 2xl:w-[1200px] 3xl:w-[1440px] h-[70vh]"
                      contentClassName="flex flex-col justify-center items-center"
    >
      <div className="flex flex-col justify-center items-center mb-14">
        <IconLogo className="w-50 h-50"/>
        <div className="text-4xl font-bold bg-gradient-to-r from-cyber-neon-400 to-cyber-pink-400 bg-clip-text text-transparent">
          W3Wallet
        </div>
      </div>
      <h2 className="text-cyber-neon-400 text-xl font-bold mb-2">Please, connect your wallet</h2>
      <p className="text-cyber-blue-200 text-md mb-10">Please connect your wallet to see your supplies, borrowings, and open positions.</p>
      <CyberGradientConnectButton/>
    </CyberCard>
  }

  return <>
    <main className="flex flex-col flex-1 justify-center items-center">
      {getContent()}
    </main>
    <PureSVGHalo/>
    {/*底部模糊层 */}
    <div className="fixed inset-0 pointer-events-none z-30">
      <div className="absolute bottom-0 inset-x-0 h-96 bg-gradient-to-t from-cyber-pink-400/10 to-transparent" />
    </div>
    {/* 第3层：轻量动画（CSS） */}
    <ScanStarAnimations />
  </>
};

export default Dashboard;
