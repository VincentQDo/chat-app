"use client";

import AppSidebar from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-provider";
import { CompactProvider } from "@/lib/compact-provider";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function GlobalChatLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/signin");
    }
  }, [user, router]);
  return (
    <>
      {user ? (
        <SidebarProvider>
          <CompactProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-col h-[calc(100dvh-1rem)]">
              {children}
            </SidebarInset>
          </CompactProvider>
        </SidebarProvider>
      ) : (
        <p>
          Hello there we have no idea who you are, going to the signin page.
        </p>
      )}
    </>
  );
}
