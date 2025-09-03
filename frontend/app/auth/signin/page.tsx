'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Eye, EyeOff, Lock, Mail, TrendingUp, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthService from '../../component/services/authService';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:5000'}/api/auth/signin`, {
        email, 
        password
      });
      AuthService.storeUserData({
        token: response.data.token,
        userId: response.data.userId,
        userEmail: email,
      });
      try {
        const balanceResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:5000'}/api/orders/balance?email=${email}`,
          {
            headers: {
              Authorization: `Bearer ${response.data.token}`
            }
          }
        );

      } catch (balanceError) {
        console.error("Error fetching balance:", balanceError);
      }

      toast.success('Successfully signed in!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Sign in error:', error);
      const errorMessage = error.response?.data?.message || 'Sign in failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <TrendingUp className="h-12 w-12 text-[#FFCC29]" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
        <p className="text-[#cac6ae] text-lg">Sign in to your InsightX trading account</p>
      </div>
      <div className="bg-[#16191D] border border-gray-700 rounded-2xl p-8 shadow-2xl">
        <form onSubmit={handleSignIn} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[#cac6ae] text-sm font-medium">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-[#1E2328] border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFCC29] focus:border-transparent transition-all"
                placeholder="Enter your email"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[#cac6ae] text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-12 py-3 bg-[#1E2328] border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFCC29] focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#FFCC29] text-[#141619] py-3 px-6 rounded-xl font-bold text-lg hover:bg-[#E6B825] focus:outline-none focus:ring-2 focus:ring-[#FFCC29] focus:ring-offset-2 focus:ring-offset-[#16191D] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-600"></div>
          <span className="px-4 text-[#cac6ae] text-sm">or</span>
          <div className="flex-1 border-t border-gray-600"></div>
        </div>
        <div className="text-center">
          <p className="text-[#cac6ae] mb-4">
            Don't have an account? Create one to start trading
          </p>
          <a 
            href="/auth/signup" 
            className="inline-flex items-center space-x-2 bg-[#1E2328] hover:bg-[#2A2F36] text-[#FFCC29] px-6 py-3 rounded-xl border border-gray-600 transition-all hover:text-[#E6B825]"
          >
            <span>Create Account</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="text-center mt-8">
        <p className="text-[#cac6ae] text-sm">
          By signing in, you agree to our{' '}
          <a href="#" className="text-[#FFCC29] hover:text-[#E6B825] transition-colors">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-[#FFCC29] hover:text-[#E6B825] transition-colors">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
