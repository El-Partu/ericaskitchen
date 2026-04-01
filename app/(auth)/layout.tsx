// 📁 app/(auth)/layout.tsx

import AnimatedLogo from "@/components/shared/AnimatedLogo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f0eb]">
      {/* ── Header ── */}
      <header className="flex justify-center border-b border-black/[0.07] bg-white px-6 py-5">
        <AnimatedLogo />
      </header>

      {/* ── Page content ── */}
      <main className="flex flex-1 items-center justify-center px-4 py-14">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="py-5 text-center font-body text-[12px] text-foreground/35">
        © {new Date().getFullYear()} Erica&apos;s Kitchen · All rights reserved.
      </footer>
    </div>
  );
}
