'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect directly to auth page
    router.push('/auth');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#141619] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FFCC29] mx-auto mb-4"></div>
        <p className="text-[#cac6ae] text-lg">Redirecting to sign in...</p>
      </div>
    </div>
  );
}
