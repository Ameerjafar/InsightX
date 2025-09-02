import { OpenTradeComponent } from "./OpenTradeComponent"
export const OpenTrade = () => {

    return (
        <div className = 'bg-[##16191D] min-h-screen px-10'>
            <div className ='shadow-2xl border border-gray-700 mb-10 rounded-md'>
                <div className = 'text-white font-bold text-lg p-3'>Open Trades</div>
                <div className = 'p-5'><OpenTradeComponent /></div>
                {/* <div className = 'flex justify-center text-white font-bold text-xl pb-3'>You have not opened any trades yet</div> */}
            </div>
        </div>
    )
}