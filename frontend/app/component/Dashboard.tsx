import { Card } from "./ui/Card";
import ChartUi from "./ui/ChartUi";
import { OpenTrade } from "./ui/openTrade/OpenTrade";

// const arg1 = ["Total Balance", "Available Margin", "Today's P&L", "Active Trades"];

// const arg2 = [10000, 5000, 342, 2];
// // const svg = [DollarIcon, PieChartIcon, ProfitArrowIcon, TradeArrowIcon];
// const arg3 = ["balance", "percentage", "percentage", 'profitLoss'];

export const Dashboard = () => {
  return (
    <div className = 'min-h-screen bg-[#141619]'>
      <div>
        <div className="flex p-20 pb-0 pl-10 text-3xl text-white font-bold">Trading Dashboard</div>
      </div>
      <div className = 'flex justify-between p-10 pt-2 text-[#cac6ae] text-md'>
        <div className ='text-lg'>
            Monitor your portfolio and trade efficiently
        </div>
        <div className = 'flex space-x-2'>
          <div className = 'h-2 w-2 rounded-full bg-green-500 mt-2 animate-ping '></div>
        <div className ='text-lg'>Market Open</div>
        </div>
      </div>
      {/* <div>
        {
          arg1.map((val, ind) => {
            const Icon = svg[ind];
            return (
              <div className = 'flex' key = { ind }>
                <Card arg1={ val } arg2 = { arg2[ind] } svg = { <Icon /> } arg3 = { arg3[ind] }/>
              </div>
            )
          })
        }
      </div> */}
      <div className = 'flex space-x-5 mx-10'>
        <Card arg1={"Total Balance"} arg2={`$ ${10_245.2}`} arg3="2.3 from yesterday" svgNumber={0}></Card>
        <Card arg1={"Available Margin"} arg2={`$ ${4_234.2}`} arg3="84% available margin" svgNumber={1}></Card>
        <Card arg1={"Today P&L"} arg2={`$ ${343}`} arg3="Today profit" svgNumber={2}></Card>
        <Card arg1={"Active Trades"} arg2={`2`} arg3="4 pending" svgNumber={3}></Card>
      </div>
      <div className = 'mt-3'><ChartUi /></div>
      <div><OpenTrade /></div>
    </div>
  );
};
