"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, TrendingUp} from "lucide-react";

export const Navigation = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem("userEmail");

    const balance: string = localStorage.getItem("userBalance")!;
    console.log("this is the user balance", balance);
    setUserEmail(email);
    setUserBalance(Number(balance));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userBalance");
    localStorage.removeItem("freeMargin");
    localStorage.removeItem("lockedMargin");
    router.push("/auth");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="bg-[#16191D] border-b border-gray-700 px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-8 w-8 text-[#FFCC29]" />
          <span className="text-xl font-bold text-white">InsightX</span>
        </div>
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center space-x-3 bg-[#1E2328] hover:bg-[#2A2F36] text-white px-4 py-2 rounded-xl border border-gray-600 transition-all"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:block">{userEmail || "User"}</span>
            <div className="text-[#FFCC29] font-semibold">
              ${userBalance.toFixed(2)}
            </div>
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#1E2328] border border-gray-600 rounded-xl shadow-2xl z-50">
              <div className="p-4 border-b border-gray-600">
                <div className="text-white font-semibold">{userEmail}</div>
                <div className="text-[#FFCC29] text-lg font-bold">
                  ${userBalance.toFixed(2)}
                </div>
                <div className="text-[#cac6ae] text-sm">Available Balance</div>
              </div>

              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-[#2A2F36] rounded-lg transition-colors flex items-center space-x-3"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
