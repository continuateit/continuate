import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  LifeBuoy,
  User,
  Users,
  Ticket,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const clientNav: NavItem[] = [
  { label: "Dashboard", path: "/portal", icon: LayoutDashboard },
  { label: "Subscriptions", path: "/portal/subscriptions", icon: CreditCard },
  { label: "Helpdesk", path: "/portal/helpdesk", icon: LifeBuoy },
  { label: "Account", path: "/portal/account", icon: User },
];

const adminNav: NavItem[] = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Tickets", path: "/admin/tickets", icon: Ticket },
  { label: "Subscriptions", path: "/admin/subscriptions", icon: CreditCard },
  { label: "Reports", path: "/admin/reports", icon: BarChart3 },
];

const DashboardLayout = ({ variant }: { variant: "client" | "admin" }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const nav = variant === "admin" ? adminNav : clientNav;
  const title = variant === "admin" ? "Admin" : "Portal";

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <Link to="/" className="font-display text-sm font-bold tracking-wider text-sidebar-foreground">
            CONTINUATE <span className="text-sidebar-foreground/50 font-normal ml-1">{title}</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex text-sidebar-foreground/60 hover:text-sidebar-foreground"
        >
          <ChevronLeft size={18} className={cn("transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {nav.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors",
              isActive(item.path)
                ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <item.icon size={18} />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <LogOut size={18} />
          {!collapsed && <span>Back to Site</span>}
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col bg-sidebar-background border-r border-sidebar-border transition-all duration-300 shrink-0",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-60 h-full flex flex-col bg-sidebar-background">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-background flex items-center px-4 gap-4 shrink-0">
          <button onClick={() => setMobileOpen(true)} className="md:hidden text-foreground">
            <Menu size={20} />
          </button>
          <h1 className="font-display text-lg font-semibold text-foreground">{title}</h1>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
