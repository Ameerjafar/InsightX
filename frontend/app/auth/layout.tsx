import { Metadata } from "next";

export const metadata: Metadata = {
  title: "InsightX - Authentication",
  description: "Sign in or sign up to your InsightX trading account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#141619] flex items-center justify-center">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
