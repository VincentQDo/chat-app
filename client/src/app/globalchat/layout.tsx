'use client'

import { SidebarProvider } from "@/components/ui/sidebar";
import { CompactProvider } from "@/lib/compact-provider";
import { ReactNode } from "react";

export default function GlobalChatLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SidebarProvider>
        <CompactProvider>
          {children}
        </CompactProvider>
      </SidebarProvider>
    </>
  );
}