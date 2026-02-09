import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import DashboardLayout from "./components/DashboardLayout";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Portal pages
import PortalDashboard from "./pages/portal/PortalDashboard";
import PortalSubscriptions from "./pages/portal/PortalSubscriptions";
import PortalHelpdesk from "./pages/portal/PortalHelpdesk";
import PortalAccount from "./pages/portal/PortalAccount";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminReports from "./pages/admin/AdminReports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public pages */}
          <Route element={<Layout><Index /></Layout>} path="/" />
          <Route element={<Layout><About /></Layout>} path="/about" />
          <Route element={<Layout><Services /></Layout>} path="/services" />
          <Route element={<Layout><Pricing /></Layout>} path="/pricing" />
          <Route element={<Layout><Contact /></Layout>} path="/contact" />
          <Route element={<Layout><Login /></Layout>} path="/login" />

          {/* Client Portal */}
          <Route element={<DashboardLayout variant="client" />} path="/portal">
            <Route index element={<PortalDashboard />} />
            <Route path="subscriptions" element={<PortalSubscriptions />} />
            <Route path="helpdesk" element={<PortalHelpdesk />} />
            <Route path="account" element={<PortalAccount />} />
          </Route>

          {/* Admin Dashboard */}
          <Route element={<DashboardLayout variant="admin" />} path="/admin">
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="tickets" element={<AdminTickets />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>

          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
