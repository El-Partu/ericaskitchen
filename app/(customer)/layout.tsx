// 📁 app/(customer)/layout.tsx

import CustomerTopBar from "@/components/customer/CustomerTopBar";
import CustomerRouteGuard from "@/components/customer/CustomerRouteGuard";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <CustomerTopBar />
      <main>
        <CustomerRouteGuard>{children}</CustomerRouteGuard>
      </main>
    </div>
  );
}
