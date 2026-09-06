"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Workflow,
  Package,
  Tags,
  Gauge,
  Briefcase,
  Users,
  Megaphone,
  LineChart,
  Settings,
  ChevronDown,
  Sparkles,
  Layers,
  FileText,
  Image as ImageIcon,
  UserCog,
  Shield,
  Puzzle,
  Database,
  SearchCheck,
  Building2,
  CreditCard,
  ScrollText,
  Bot,
  BookMarked,
  Quote,
  UserPlus,
  CalendarCheck,
  CalendarCog,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { adminCollectionsPath } from "@/admin";
import { adminContentIndexPath } from "@/admin";
import { useOryCMSSession, hasOryCMSClientPermission } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";

/** A permission requirement for showing a nav entry. */
type NavPermission = { resource: string; action: string };

type ChildItem = {
  label: string;
  to: string;
  icon?: React.ComponentType<{ className?: string }>;
  permission?: NavPermission;
};

type Item = {
  label: string;
  to?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: ChildItem[];
  permission?: NavPermission;
};

// Ordered by how often a role actually touches each area day to day:
// authoring content first, then client/lead work, growth, identity/access
// config, technical platform integrations, and system settings last.
const NAV: { section: string; items: Item[] }[] = [
  {
    section: "Workspace",
    items: [{ label: "Overview", to: "/admin", icon: LayoutDashboard }],
  },
  {
    section: "Content",
    items: [
      { label: "Collections", to: adminCollectionsPath(), icon: Layers, permission: { resource: "collections", action: "read" } },
      { label: "Content", to: adminContentIndexPath(), icon: FileText, permission: { resource: "content", action: "read" } },
      { label: "Assets", to: "/admin/media", icon: ImageIcon, permission: { resource: "media", action: "read" } },
    ],
  },
  {
    section: "Engagements",
    items: [
      { label: "Clients", to: "/admin/clients", icon: Users, permission: { resource: "clients", action: "read" } },
      {
        label: "Hire Staff Requests",
        to: "/admin/hire-staff-requests",
        icon: UserPlus,
        permission: { resource: "hire-staff-requests", action: "read" },
      },
      {
        label: "Bookings",
        to: "/admin/bookings",
        icon: CalendarCheck,
        permission: { resource: "bookings", action: "read" },
      },
      {
        label: "Availability",
        to: "/admin/booking-availability",
        icon: CalendarCog,
        permission: { resource: "bookings", action: "read" },
      },
      {
        label: "Delivery Suite",
        icon: Workflow,
        children: [
          { label: "PerformX", to: "/admin/projectx", icon: Briefcase, permission: { resource: "projects", action: "read" } },
        ],
      },
      {
        label: "Feature",
        icon: Package,
        children: [
          {
            label: "Case Studies",
            to: "/admin/case-studies",
            icon: BookMarked,
            permission: { resource: "case-studies", action: "read" },
          },
          {
            label: "Testimonials",
            to: "/admin/testimonials",
            icon: Quote,
            permission: { resource: "testimonials", action: "read" },
          },
          {
            label: "Companies",
            to: "/admin/companies",
            icon: Building2,
            permission: { resource: "companies", action: "read" },
          },
          {
            label: "Announcement",
            to: "/admin/announcements",
            icon: Megaphone,
            permission: { resource: "announcements", action: "read" },
          },
        ],
      },
    ],
  },
  {
    section: "Growth",
    items: [
      { label: "Marketing", to: "/admin/marketing", icon: Megaphone },
      { label: "Insights", to: "/admin/analytics", icon: LineChart },
    ],
  },
  {
    section: "Identity",
    items: [
      { label: "Team Members", to: "/admin/users", icon: UserCog, permission: { resource: "users", action: "read" } },
      { label: "Roles & Access", to: "/admin/roles", icon: Shield, permission: { resource: "roles", action: "read" } },
    ],
  },
  {
    section: "Platform",
    items: [
      { label: "SEO", to: "/admin/seo", icon: SearchCheck, permission: { resource: "seo", action: "read" } },
      { label: "Payments", to: "/admin/payments", icon: CreditCard, permission: { resource: "payments", action: "read" } },
      { label: "Integrations", to: "/admin/plugins", icon: Puzzle, permission: { resource: "plugins", action: "read" } },
      { label: "WhatsApp Automation", to: "/admin/whatsapp", icon: Bot, permission: { resource: "whatsapp", action: "manage" } },
      { label: "Database", to: "/admin/database", icon: Database, permission: { resource: "migrations", action: "read" } },
    ],
  },
  {
    section: "System",
    items: [
      { label: "Settings", to: "/admin/settings", icon: Settings, permission: { resource: "settings", action: "read" } },
      { label: "MFA Logs", to: "/admin/console-logs", icon: ScrollText, permission: { resource: "audit", action: "read" } },
    ],
  },
];

export function AppSidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  // Accordion behavior: only one dropdown open at a time, all closed on load —
  // opening one collapses whichever was previously open.
  const [openLabel, setOpenLabel] = useState<string | null>(null);
  const { permissions, loaded } = useOryCMSSession();

  // Gate a nav entry by its permission. Entries with no `permission` are always
  // shown. Permission-gated entries appear only once the session has loaded AND
  // the role is allowed (fail-closed during load). Enforcement is on the backend;
  // this only controls visibility.
  const allow = (perm?: NavPermission): boolean => {
    if (!perm) return true;
    if (!loaded) return false;
    return hasOryCMSClientPermission(permissions, perm.resource, perm.action);
  };

  const visibleNav = NAV.map((group) => {
    const items = group.items
      .map((item) => {
        if (item.children) {
          const children = item.children.filter((c) => allow(c.permission));
          // A parent with children is shown only if at least one child survives,
          // unless it also has its own direct link + permission.
          if (children.length === 0 && !item.to) return null;
          return { ...item, children };
        }
        return allow(item.permission) ? item : null;
      })
      .filter((i): i is Item => i !== null);
    return { ...group, items };
  }).filter((group) => group.items.length > 0);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-border bg-sidebar transition-[width] duration-300 ease-out",
        collapsed ? "w-[68px]" : "w-[248px]",
      )}
    >
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border/70 bg-sidebar px-4">
        <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-surface">
          <Image
            src="/favicon.png"
            alt="OryCMS logo"
            width={24}
            height={24}
            className="h-6 w-6 object-contain"
          />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-[13px] font-semibold tracking-tight truncate">OryCMS</div>
            <div className="truncate text-[11px] text-muted-foreground">
              By OrynticLabs Private Limited
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-5">
        {!loaded ? (
          // Permission-gated items are hidden fail-closed until the session
          // loads (see `allow` above) — without this skeleton that reads as
          // a real, much-shorter sidebar for a beat before everything pops
          // in, rather than an obviously-still-loading state.
          <div className="space-y-5" aria-hidden>
            {[3, 4, 2].map((count, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="mx-2 h-2.5 w-16 bg-foreground/10" />
                {Array.from({ length: count }).map((_, j) => (
                  <Skeleton key={j} className="mx-0.5 h-8 rounded-md bg-foreground/5" />
                ))}
              </div>
            ))}
          </div>
        ) : (
          visibleNav.map((group) => (
          <div key={group.section}>
            {!collapsed && (
              <div className="px-2 pb-1.5 text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground/80">
                {group.section}
              </div>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  item.to &&
                  (item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to));
                const hasKids = !!item.children;
                const isOpen = openLabel === item.label;
                const Icon = item.icon;

                if (hasKids) {
                  return (
                    <li key={item.label}>
                      <button
                        onClick={() => setOpenLabel((current) => (current === item.label ? null : item.label))}
                        className={cn(
                          "group w-full flex items-center gap-2.5 px-2 h-8 rounded-md text-[13px] text-sidebar-foreground hover:bg-[#FBE4DF] transition-colors",
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                        {!collapsed && (
                          <>
                            <span className="truncate">{item.label}</span>
                            <ChevronDown
                              className={cn(
                                "ml-auto h-3.5 w-3.5 text-muted-foreground transition-transform",
                                isOpen && "rotate-180",
                              )}
                            />
                          </>
                        )}
                      </button>
                      {!collapsed && isOpen && (
                        <ul className="mt-0.5 ml-6 pl-3 border-l border-border/70 space-y-0.5">
                          {item.children!.map((c) => {
                            const cActive = pathname.startsWith(c.to);
                            return (
                              <li key={c.label}>
                                <Link
                                  href={c.to}
                                  className={cn(
                                    "relative flex items-center gap-2 h-7 px-2 rounded-md text-[12.5px] text-muted-foreground hover:text-foreground hover:bg-[#FBE4DF] transition-colors",
                                    cActive && "bg-[#FBE4DF] font-semibold text-foreground hover:bg-[#FBE4DF]",
                                  )}
                                >
                                  {cActive && (
                                    <span className="absolute left-0 top-1 bottom-1 w-[2px] rounded-r bg-foreground" />
                                  )}
                                  <span className="truncate">{c.label}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={item.label}>
                    <Link
                      href={item.to!}
                      className={cn(
                        "group flex items-center gap-2.5 px-2 h-8 rounded-md text-[13px] text-sidebar-foreground hover:bg-[#FBE4DF] transition-colors relative",
                        active && "bg-[#FBE4DF] text-foreground font-semibold hover:bg-[#FBE4DF]",
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r bg-foreground" />
                      )}
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active
                            ? "text-foreground"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />
                      {!collapsed && (
                        <>
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto text-[10.5px] font-medium px-1.5 h-[18px] grid place-items-center rounded-full bg-foreground text-background num">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          ))
        )}
      </nav>

      {/* Upsell */}
      {!collapsed && (
        <div className="m-2.5 p-3 rounded-lg border border-border bg-surface">
          <div className="flex items-center gap-1.5 text-[11.5px] font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            AI Copilot
          </div>
          <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
            Ask questions across orders, inventory, and customers.
          </p>
          <button className="mt-2 w-full h-7 rounded-md bg-foreground text-background text-[11.5px] font-medium hover:opacity-90 transition-opacity">
            Try Copilot
          </button>
        </div>
      )}
    </aside>
  );
}
