import {
  Activity,
  Clock3,
  FolderOpen,
  Library,
  LayoutGrid,
  type LucideIcon,
  Settings,
  Star,
  Users,
  UsersRound,
} from "lucide-react";
import { categories } from "./categories";

export type NavLabelKey =
  | "overview"
  | "allDocuments"
  | "recent"
  | "starred"
  | "shared"
  | "collections"
  | "team"
  | "activity"
  | "settings";

export interface NavItem {
  href: string;
  icon: LucideIcon;
  labelKey: NavLabelKey;
}

export const workspaceNav: NavItem[] = [
  { href: "/", icon: LayoutGrid, labelKey: "overview" },
  { href: "/documents", icon: FolderOpen, labelKey: "allDocuments" },
  { href: "/recent", icon: Clock3, labelKey: "recent" },
  { href: "/starred", icon: Star, labelKey: "starred" },
  { href: "/shared", icon: UsersRound, labelKey: "shared" },
  { href: "/collections", icon: Library, labelKey: "collections" },
];

export const categoryNav = categories.map((c) => ({
  href: `/categories/${c.slug}`,
  icon: c.icon,
  slug: c.slug,
  color: c.color,
}));

export const managementNav: NavItem[] = [
  { href: "/team", icon: Users, labelKey: "team" },
  { href: "/activity", icon: Activity, labelKey: "activity" },
  { href: "/settings", icon: Settings, labelKey: "settings" },
];

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
