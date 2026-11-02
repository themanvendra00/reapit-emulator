import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useApiConfig } from "../api/ApiConfigContext.jsx";
import { useApiClient } from "../api/useApiClient.js";
import { useAuth } from "../auth/AuthContext.jsx";
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
} from "./ui/sidebar.jsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu.jsx";
import { Avatar, AvatarFallback } from "./ui/Avatar.jsx";
import {
  BadgeIcon,
  DashboardIcon,
  HomeIcon,
  LogOutIcon,
  SettingsIcon,
  UsersIcon,
} from "./icons.jsx";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { to: "/vendors", label: "Vendors", icon: UsersIcon },
  { to: "/properties", label: "Properties", icon: HomeIcon },
  { to: "/negotiators", label: "Negotiators", icon: BadgeIcon },
];

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const chars =
    parts.length > 1
      ? [parts[0][0], parts[parts.length - 1][0]]
      : [parts[0][0]];
  return chars.join("").toUpperCase();
}

export default function AppSidebar({ onOpenSettings }) {
  const { user, logout } = useAuth();
  const { baseUrl } = useApiConfig();
  const api = useApiClient();

  const health = useQuery({
    queryKey: ["health", baseUrl],
    queryFn: () => api.get("/vendors/?pageSize=1"),
    retry: 0,
    refetchInterval: 30_000,
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              asChild
            >
              <NavLink to="/dashboard">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-primary text-sm font-bold text-primary-foreground">
                  R
                </span>
                <span className="text-base font-semibold">Reapit</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton asChild tooltip={label}>
                    <NavLink
                      to={to}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : ""
                      }
                    >
                      <Icon />
                      <span>{label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onOpenSettings}
              className="h-auto flex-col items-start gap-1 py-2"
            >
              <div className="flex w-full items-center gap-2">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    health.isError
                      ? "bg-destructive"
                      : health.isFetching
                        ? "bg-warning"
                        : "bg-success"
                  }`}
                />
                <span className="truncate text-xs font-medium">{baseUrl}</span>
              </div>
              <p className="truncate text-[11px] text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
                {health.isError
                  ? "Not reachable — tap to change"
                  : "Emulator connected"}
              </p>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent"
                >
                  <Avatar size="sm">
                    <AvatarFallback>{initials(user?.email)}</AvatarFallback>
                  </Avatar>
                  <span className="truncate text-xs font-medium">
                    {user?.email}
                  </span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" side="top" align="start">
                <DropdownMenuItem onClick={onOpenSettings}>
                  <SettingsIcon />
                  Connection settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} variant="destructive">
                  <LogOutIcon />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
