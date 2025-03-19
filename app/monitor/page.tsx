import { Divider } from "@nextui-org/react";
import { TeamAnnouncementTab, TeamSummary, TeamView } from "./components";
import dynamic from 'next/dynamic';

const TeamPerformanceChart = dynamic(
  () => import('./components').then((mod)=> mod.TeamPerformanceChart),
  { ssr: false }
)


export default function MonitorDashboard() {
  
  return (
    <div className="flex flex-col p-2 h-full">
      <p className="text-primary font-bold text-xl py-2">Dashboard do Monitor</p>
      <Divider/>
      <div className="mb-2">
        <TeamView />
      </div>
      <Divider />
      <div className="flex flex-row w-full ">
        <TeamPerformanceChart />
        <TeamAnnouncementTab />
      </div>
      <div className="flex flex-row w-full gap-2 my-3">
        <div className="p-2">
          <p className="font-bold text-primary">Relatório diário</p>
          <TeamSummary data={{nc: 11, nt: 25, tmat: '6:05', tmac: '8:14', npar: 11}} />
        </div>
        <Divider orientation="vertical" />
        <div className="p-2">
          <p className='font-bold text-primary'>Relatório Mensal</p>
          <TeamSummary data={{nc: 11, nt: 25, tmat: '6:05', tmac: '8:14', npar: 11}} />
        </div>
      </div>
    </div>
  );
}
 