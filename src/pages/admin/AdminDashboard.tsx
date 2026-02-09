import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Ticket, CreditCard, TrendingUp } from "lucide-react";

const stats = [
  { label: "Total Clients", value: "142", change: "+8 this month", icon: Users },
  { label: "Open Tickets", value: "23", change: "5 high priority", icon: Ticket },
  { label: "Active Subs", value: "128", change: "R702K MRR", icon: CreditCard },
  { label: "Uptime", value: "99.97%", change: "Last 30 days", icon: TrendingUp },
];

const recentActivity = [
  { action: "New ticket", detail: "TKT-1042 — VPN connectivity issue", user: "Alex Johnson", time: "2h ago" },
  { action: "Subscription upgraded", detail: "Professional → Enterprise", user: "Sarah Mbeki", time: "5h ago" },
  { action: "Ticket resolved", detail: "TKT-1039 — Backup job failure", user: "Thabo Nkosi", time: "8h ago" },
  { action: "New client", detail: "Onboarded — FinTech Solutions Ltd", user: "System", time: "1d ago" },
  { action: "Invoice paid", detail: "INV-2026-02 — R12,800", user: "Sarah Mbeki", time: "1d ago" },
];

const AdminDashboard = () => (
  <div className="space-y-8">
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
      <h2 className="font-display text-2xl font-bold text-foreground mb-1">Admin Overview</h2>
      <p className="text-sm text-muted-foreground">System-wide metrics and recent activity.</p>
    </motion.div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <motion.div key={s.label} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
                <s.icon size={18} className="text-muted-foreground" />
              </div>
              <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.change}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>

    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start justify-between py-3 border-b border-border last:border-0 gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge variant="outline" className="text-xs">{a.action}</Badge>
                    <span className="text-xs text-muted-foreground">{a.time}</span>
                  </div>
                  <p className="text-sm text-foreground truncate">{a.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{a.user}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  </div>
);

export default AdminDashboard;
