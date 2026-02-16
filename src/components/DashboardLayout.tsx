import { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  LifeBuoy,
  User,
  Users,
  Ticket,
  BarChart3,
  FileText,
  FileCheck2,
  FlaskConical,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

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
  { label: "Quotes", path: "/admin/quotes", icon: FileText },
  { label: "Contracts", path: "/admin/contracts", icon: FileCheck2 },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Tickets", path: "/admin/tickets", icon: Ticket },
  { label: "Subscriptions", path: "/admin/subscriptions", icon: CreditCard },
  { label: "Reports", path: "/admin/reports", icon: BarChart3 },
  { label: "Tests", path: "/admin/tests", icon: FlaskConical },
];

const DashboardLayout = ({ variant }: { variant: "client" | "admin" }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const nav = variant === "admin" ? adminNav : clientNav;
  const title = variant === "admin" ? "Admin" : "Portal";

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && (
          <Link to="/" className="font-display text-sm font-bold tracking-wider text-white">
            CONTINUATE <span className="text-white/60 font-normal ml-1">{title}</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex text-white/60 hover:text-white"
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
                ? "bg-white/10 text-white font-medium"
                : "text-white/70 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon size={18} />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
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
          "hidden md:flex flex-col bg-[#0a0a0a] text-white border-r border-white/10 transition-all duration-300 shrink-0",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-60 h-full flex flex-col bg-[#0a0a0a] text-white">
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
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden md:inline text-xs text-muted-foreground">{user?.email ?? "Signed in"}</span>
            <button
              onClick={async () => {
                await signOut();
                navigate("/login");
              }}
              className="inline-flex items-center gap-2 text-sm text-foreground hover:text-foreground/80"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
