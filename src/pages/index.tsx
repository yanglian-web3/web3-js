import type { NextPage } from 'next';
import ScanStarAnimations from "../components/dashboard/scan-star-animations";
import PureSVGHalo from "../components/dashboard/pure-svg-halo";
import CyberCard from "../components/card/cyber-card";

const Dashboard: NextPage = () => {

  /**
   * 获取渲染内容布局
   */
  const getContent = () => {
    return <CyberCard className=" w-10/12 lg:w-[800px] xl:w-[1000px] 2xl:w-[1200px] 3xl:w-[1440px] h-[70vh]"/>
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
