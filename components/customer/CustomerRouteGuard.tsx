"use client";

import { useAuth } from "@/lib/auth-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CustomerRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const redirectTo =
        pathname && pathname.startsWith("/") ? pathname : "/dashboard";
      router.replace(`/login?redirect=${encodeURIComponent(redirectTo)}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
