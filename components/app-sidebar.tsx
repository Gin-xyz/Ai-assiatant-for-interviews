import { Home, Settings, Brain, Play, BookOpen, TrendingUp, User, History, Target } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { KamikazBot } from "./kamikaz-bot"

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Start Interview",
    url: "/interview",
    icon: Play,
  },
  {
    title: "Practice Problems",
    url: "/practice",
    icon: BookOpen,
  },
  {
    title: "Interview History",
    url: "/history",
    icon: History,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: TrendingUp,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
]

const interviewTypes = [
  {
    title: "Technical",
    url: "/interview/technical",
    icon: Brain,
  },
  {
    title: "Behavioral",
    url: "/interview/behavioral",
    icon: Target,
  },
  {
    title: "System Design",
    url: "/interview/system-design",
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar className="bg-slate-900/95 backdrop-blur-xl border-slate-800" collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <KamikazBot size="md" />
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="font-bold text-white text-lg">Kamikaz</h2>
            <p className="text-xs text-slate-400">Interview AI</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-300 group-data-[collapsible=icon]:hidden">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="text-slate-300 hover:text-white hover:bg-slate-800/50">
                    <a href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-300 group-data-[collapsible=icon]:hidden">
            Interview Types
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {interviewTypes.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="text-slate-300 hover:text-white hover:bg-slate-800/50">
                    <a href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="text-xs text-slate-500 text-center group-data-[collapsible=icon]:hidden">
          Powered by AI • v2.0
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
