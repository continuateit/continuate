import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Layout from "./components/Layout";
import DashboardLayout from "./components/DashboardLayout";
import RequireAuth from "./components/RequireAuth";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import Networking from "./pages/Networking";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import PortalDashboard from "./pages/portal/PortalDashboard";
import PortalSubscriptions from "./pages/portal/PortalSubscriptions";
import PortalHelpdesk from "./pages/portal/PortalHelpdesk";
import PortalAccount from "./pages/portal/PortalAccount";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminReports from "./pages/admin/AdminReports";
import AdminQuotes from "./pages/admin/AdminQuotes";
import AdminQuoteBuilder from "./pages/admin/AdminQuoteBuilder";
import AdminQuoteDetail from "./pages/admin/AdminQuoteDetail";
import AdminContracts from "./pages/admin/AdminContracts";
import AdminContractDetail from "./pages/admin/AdminContractDetail";
import AdminTests from "./pages/admin/AdminTests";
import QuoteLiveView from "./pages/QuoteLiveView";
import QuoteAccept from "./pages/QuoteAccept";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public pages */}
          <Route element={<Layout><Index /></Layout>} path="/" />
          <Route element={<Layout><About /></Layout>} path="/about" />
          <Route element={<Layout><Services /></Layout>} path="/services" />
          <Route element={<Layout><Pricing /></Layout>} path="/pricing" />
          <Route element={<Layout><Networking /></Layout>} path="/networking" />
          <Route element={<Layout><Blog /></Layout>} path="/blog" />
          <Route element={<Layout><BlogPost /></Layout>} path="/blog/:slug" />
          <Route element={<Layout><Contact /></Layout>} path="/contact" />
          <Route element={<Layout><Login /></Layout>} path="/login" />

          <Route path="/quote/:id" element={<QuoteLiveView />} />
          <Route path="/quote/:id/accept" element={<QuoteAccept />} />

          <Route
            path="/portal"
            element={(
              <RequireAuth>
                <DashboardLayout variant="client" />
              </RequireAuth>
            )}
          >
            <Route index element={<PortalDashboard />} />
            <Route path="subscriptions" element={<PortalSubscriptions />} />
            <Route path="helpdesk" element={<PortalHelpdesk />} />
            <Route path="account" element={<PortalAccount />} />
          </Route>

          <Route
            path="/admin"
            element={(
              <RequireAuth adminOnly>
                <DashboardLayout variant="admin" />
              </RequireAuth>
            )}
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="tickets" element={<AdminTickets />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="quotes" element={<AdminQuotes />} />
            <Route path="quotes/new" element={<AdminQuoteBuilder />} />
            <Route path="quotes/:id" element={<AdminQuoteDetail />} />
            <Route path="contracts" element={<AdminContracts />} />
            <Route path="contracts/:id" element={<AdminContractDetail />} />
            <Route path="tests" element={<AdminTests />} />
          </Route>

          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
