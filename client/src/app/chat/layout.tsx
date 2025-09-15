"use client"

import AppSidebar from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CompactProvider } from "@/lib/compact-provider";
import { ReactNode } from "react";

export default function GlobalChatLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SidebarProvider>
        <CompactProvider>
          <AppSidebar />
          <SidebarInset className="flex flex-col h-[calc(100dvh-1rem)]">

            {children}
          </SidebarInset>

        </CompactProvider>
      </SidebarProvider>
    </>
  );
}