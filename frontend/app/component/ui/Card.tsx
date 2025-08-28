import { DollarSign, PieChart, TrendingUp, Repeat } from "lucide-react";

const svg = [DollarSign, PieChart, TrendingUp, Repeat];
interface CardObject {
  arg1: string;
  svgNumber: number;
  arg2: string;
  arg3: string;
}

export const Card = ({ arg1, svgNumber, arg2, arg3 }: CardObject) => {
    const Icon = svg[svgNumber]
  return (
    <div className="bg-[##16191D] h-40 w-96 mt-0 pt-4  shadow-2xl border border-gray-700 rounded-2xl text-white">
      <div className = 'flex justify-between font-bold px-[24px]'>
        <div className = 'text-[#cac6ae] text-md'>{arg1}</div>
        <div>
          <Icon className="font-bold text-[#FFCC29]" />
        </div>
      </div>
      <div className = 'text-4xl px-[20px] pt-2 font-extrabold'>{arg2}</div>
      <div className = 'px-[24px] pt-2 text-green-500'>{ arg3 }</div>
    </div>
  );
};
