import { PlusIcon } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";

export default function AppSidebar({ userName }: { userName: string }) {
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <span className="text-base font-semibold">Banterbox</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <PlusIcon size={16} />
                  <span>New Chats</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarGroup>
              <SidebarGroupLabel>Active Chats</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="data-[slot=sidebar-menu-button]:!p-1.5"
                  >
                    <span>Global Chat</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: userName, email: 'test@example.email' }} />
      </SidebarFooter>
    </Sidebar>
  )
}