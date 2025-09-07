"use client"

import {
  ChevronsUpDown,
  LogOut,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth-provider";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { useCompact } from "@/lib/compact-provider";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user, logOut } = useAuth();
  const { isCompact, setIsCompact } = useCompact();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.displayName ?? "N/A"}</span>
                <span className="truncate text-xs">{user?.email ?? "N/A"}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex flex-col gap-4 px-1 py-1.5 text-left text-sm">
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.displayName ?? "N/A"}</span>
                  <span className="truncate text-xs">{user?.email ?? "N/A"}</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <Label htmlFor="compact-mode">Compact Mode</Label>
                  <Switch checked={isCompact} onCheckedChange={setIsCompact} id="compact-mode" />
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2" onClick={logOut}>
              <LogOut size={16} className="text-muted-foreground" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
