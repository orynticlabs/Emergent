import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CreditCard,
  LogOut,
  PanelLeft,
  Plus,
  Search,
  Settings,
  Shield,
  Workflow,
  Sparkles,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, oryCMSAvatarUrl } from "@/lib/utils";
import { useOryCMSSession } from "@/hooks";

const searchGroups = [
  {
    heading: "Navigate",
    items: [
      { label: "Overview", route: "/admin", icon: Workflow, shortcut: "G O" },
      { label: "Projects", route: "/admin/projectx", icon: Workflow, shortcut: "G R" },
      { label: "Clients", route: "/admin/clients", icon: Shield, shortcut: "G C" },
      { label: "Settings", route: "/admin/settings", icon: Settings, shortcut: "G S" },
    ],
  },
  {
    heading: "Recent entities",
    items: [
      { label: "ProjectX board", route: "/admin/projectx", icon: CreditCard, shortcut: "O 1" },
      { label: "Client directory", route: "/admin/clients", icon: Shield, shortcut: "Q R" },
      { label: "Billing settings", route: "/admin/settings", icon: CreditCard, shortcut: "B I" },
    ],
  },
];

export function Topbar({
  onToggle,
  section = "Overview",
  insightsOpen = false,
  onInsightsToggle,
}: {
  onToggle: () => void;
  section?: string;
  insightsOpen?: boolean;
  onInsightsToggle?: () => void;
}) {
  const router = useRouter();
  const { user, roleName, refresh } = useOryCMSSession();
  const displayName = user?.name?.trim() || user?.email || "Account";
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await fetch("/api/orycms/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // Best-effort — still navigate to login even if the request failed.
    }
    await refresh();
    router.push("/admin/login");
  };
  const initials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || displayName[0]?.toUpperCase() || "?";
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const navigate = (route: string) => {
    setSearchOpen(false);
    router.push(route);
  };

  return (
    <>
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search pages, orders, queues, and settings..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {searchGroups.map((group, index) => (
            <div key={group.heading}>
              <CommandGroup heading={group.heading}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <CommandItem
                      key={item.label}
                      value={item.label}
                      onSelect={() => navigate(item.route)}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      <CommandShortcut>{item.shortcut}</CommandShortcut>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {index < searchGroups.length - 1 ? <CommandSeparator /> : null}
            </div>
          ))}
        </CommandList>
      </CommandDialog>

      <header className="h-14 shrink-0 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
        <div className="h-full px-4 flex items-center gap-3">
          <button
            onClick={onToggle}
            className="h-8 w-8 grid place-items-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </button>

          {/* Breadcrumb */}
          <div className="hidden md:flex items-center gap-1.5 text-[13px]">
            <span className="text-muted-foreground">OryCMS</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="font-medium">{section}</span>
          </div>

          {/* Search / Command */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={() => setSearchOpen(true)}
              className={cn(
                "group flex items-center gap-2 h-9 w-full max-w-[520px] px-3 rounded-lg border border-border bg-surface hover:border-border-strong text-[13px] text-muted-foreground transition-colors",
              )}
            >
              <Search className="h-3.5 w-3.5" />
              <span className="truncate">Search products, orders, customers…</span>
              <kbd className="ml-auto hidden sm:inline-flex items-center gap-0.5 text-[10.5px] font-mono text-muted-foreground/80 px-1.5 h-5 rounded border border-border bg-background">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onInsightsToggle}
              title="AI Insights"
              className={cn(
                "grid h-8 w-8 place-items-center rounded-md transition-colors",
                insightsOpen
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Sparkles className="h-4 w-4" />
            </button>

            <NotificationBell />

            <button className="ml-1 hidden sm:inline-flex h-8 items-center gap-1.5 pl-2 pr-3 rounded-md bg-foreground text-background text-[12.5px] font-medium hover:opacity-90 transition-opacity">
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              Quick action
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 rounded-full">
                  <Avatar className="h-8 w-8 border border-border">
                    {user?.id && <AvatarImage src={oryCMSAvatarUrl(user.id)} alt="" />}
                    <AvatarFallback className="bg-gradient-to-br from-chart-3 to-chart-4 text-[11px] font-semibold text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="pb-2">
                  <div className="text-[12.5px] font-semibold">{displayName}</div>
                  <div className="mt-0.5 truncate text-[11px] font-normal text-muted-foreground">
                    {user?.email}
                    {user?.email && " · "}
                    {roleName ?? "No role"}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/admin/settings")}>
                  <User className="h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/admin/projectx")}>
                  <Workflow className="h-4 w-4" />
                  Projects desk
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={signingOut}
                  className="text-destructive focus:text-destructive"
                  onClick={() => void handleSignOut()}
                >
                  <LogOut className="h-4 w-4" />
                  {signingOut ? "Signing out…" : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
}
