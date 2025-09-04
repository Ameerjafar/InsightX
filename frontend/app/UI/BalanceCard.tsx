import { DollarSign, PieChart, TrendingUp, Repeat } from "lucide-react";

const svg = [DollarSign, PieChart, TrendingUp, Repeat];

interface BalanceCardProps {
  arg1: string;
  svgNumber: number;
  arg2: string;
  arg3: string;
  isProfit?: boolean;
}

export const BalanceCard = ({ arg1, svgNumber, arg2, arg3, isProfit }: BalanceCardProps) => {
  const Icon = svg[svgNumber];
  const textColorClass = isProfit ? "text-green-500" : "text-red-500";
  
  return (
    <div className="bg-[#16191D] h-40 w-96 mt-0 pt-4 shadow-2xl border border-gray-700 rounded-2xl text-white">
      <div className="flex justify-between font-bold px-[24px]">
        <div className="text-[#cac6ae] text-md">{arg1}</div>
        <div>
          <Icon className="font-bold text-[#FFCC29]" />
        </div>
      </div>
      <div className={`text-4xl px-[20px] pt-2 font-extrabold ${textColorClass}`}>
        {arg2}
      </div>
      <div className="px-[24px] pt-2 text-green-500">{arg3}</div>
    </div>
  );
};
