import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  Calendar,
  BarChart3,
  Megaphone,
  UsersRound,
  Shield,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { User } from "@/lib/types/database";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

export const APP_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pipeline", label: "Projekte", icon: KanbanSquare },
  { href: "/customers", label: "Kunden", icon: Users },
  { href: "/calendar", label: "Kalender", icon: Calendar },
  { href: "/social", label: "Social KPIs", icon: BarChart3 },
  { href: "/posting", label: "Posting-Planer", icon: Megaphone },
  { href: "/team", label: "Team", icon: UsersRound },
  { href: "/admin", label: "Admin", icon: Shield, adminOnly: true },
  { href: "/settings", label: "Einstellungen", icon: Settings },
];

export const PORTAL_NAV_ITEMS: NavItem[] = [
  { href: "/portal", label: "Meine Projekte", icon: KanbanSquare },
  { href: "/portal/settings", label: "Einstellungen", icon: Settings },
];

export function filterNavItems(items: NavItem[], user: Pick<User, "role">): NavItem[] {
  return items.filter((item) => !item.adminOnly || user.role === "admin");
}
