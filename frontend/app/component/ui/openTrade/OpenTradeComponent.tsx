interface TradeCompoentObject {
  asset: string;
  entry: number;
  current: number;
  type: "BUY" | "SELL";
}

export const OpenTradeComponent = ({
  asset,
  entry,
  current,
  type,
}: TradeCompoentObject) => {
  return (
    <div>
      <div className="bg-[##16191D] shadow-2xl border border-gray-700 w-full text-white p-2 rounded-md">
        <div className="flex justify-between">
          <div className = 'text-lg font-semibold pt-3'>{asset}</div>
          <div className="flex space-x-5">
            <div className = 'text-sm pt-2 text-gray-400'>
              <div>Entry: {entry}</div>
              <div>current: {current}</div>
            </div>
            <div className = 'pr-2'>
                <div>
                    +150
                </div>
                <div className = 'w-20 text-center bg-yellow-500 rounded-md p-1 text-sm'>{ type }</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
