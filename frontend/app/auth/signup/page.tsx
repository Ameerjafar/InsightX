'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Eye, EyeOff, Lock, Mail, TrendingUp, User, Shield, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:5000'}/api/auth/signup`, {
        email,
        password
      });

      toast.success('Account created successfully! Please sign in.');
      router.push('/auth');
    } catch (error: unknown) {
      console.error('Sign up error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed. Please try again.';
      const responseError = error as { response?: { data?: { message?: string } } };
      const finalErrorMessage = responseError?.response?.data?.message || errorMessage;
      toast.error(finalErrorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <TrendingUp className="h-12 w-12 text-[#FFCC29]" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
        <p className="text-[#cac6ae] text-lg">Join InsightX and start your trading journey</p>
      </div>

      {/* Sign Up Form */}
      <div className="bg-[#16191D] border border-gray-700 rounded-2xl p-8 shadow-2xl">
        <form onSubmit={handleSignUp} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-[#cac6ae] text-sm font-medium">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-[#1E2328] border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFCC29] focus:border-transparent transition-all"
                placeholder="Enter your full name"
              />
            </div>
          </div>
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
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">Must be at least 6 characters long</p>
          </div>
          <div className="space-y-2">
            <label className="text-[#cac6ae] text-sm font-medium">Confirm Password</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-10 pr-12 py-3 bg-[#1E2328] border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFCC29] focus:border-transparent transition-all"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#FFCC29] text-[#141619] py-3 px-6 rounded-xl font-bold text-lg hover:bg-[#E6B825] focus:outline-none focus:ring-2 focus:ring-[#FFCC29] focus:ring-offset-2 focus:ring-offset-[#16191D] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-600"></div>
          <span className="px-4 text-[#cac6ae] text-sm">or</span>
          <div className="flex-1 border-t border-gray-600"></div>
        </div>
        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-[#cac6ae] mb-4">
            Already have an account? Sign in to continue trading
          </p>
          <a 
            href="/auth" 
            className="inline-flex items-center space-x-2 bg-[#1E2328] hover:bg-[#2A2F36] text-[#FFCC29] px-6 py-3 rounded-xl border border-gray-600 transition-all hover:text-[#E6B825]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Sign In</span>
          </a>
        </div>
      </div>

      <div className="mt-8 bg-[#16191D] border border-gray-700 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-white font-semibold mb-4 text-center">Why Choose InsightX?</h3>
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex items-center text-[#cac6ae]">
            <div className="w-2 h-2 bg-[#FFCC29] rounded-full mr-3"></div>
            <span>Start with $5,000 demo balance</span>
          </div>
          <div className="flex items-center text-[#cac6ae]">
            <div className="w-2 h-2 bg-[#FFCC29] rounded-full mr-3"></div>
            <span>Advanced trading tools</span>
          </div>
          <div className="flex items-center text-[#cac6ae]">
            <div className="w-2 h-2 bg-[#FFCC29] rounded-full mr-3"></div>
            <span>24/7 market access</span>
          </div>
        </div>
      </div>
      <div className="text-center mt-8">
        <p className="text-[#cac6ae] text-sm">
          By creating an account, you agree to our{' '}
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
