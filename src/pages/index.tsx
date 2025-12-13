import type { NextPage } from 'next';
import ScanStarAnimations from "../components/dashboard/scan-star-animations";
import PureSVGHalo from "../components/dashboard/pure-svg-halo";

const Dashboard: NextPage = () => {
  return <>
    <main className="flex flex-col">


    </main>
    {/*光晕*/}
    {/*<div className="fixed" style={{width: "50vw",height:"50vw", right: "8vw",bottom: "-15vw"}}>*/}
    {/*  */}
    {/*</div>*/}
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
