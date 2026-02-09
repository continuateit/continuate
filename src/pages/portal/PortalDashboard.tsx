import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, LifeBuoy, Shield, Clock } from "lucide-react";

const stats = [
  { label: "Active Plan", value: "Professional", icon: CreditCard },
  { label: "Open Tickets", value: "3", icon: LifeBuoy },
  { label: "Devices Monitored", value: "24", icon: Shield },
  { label: "Next Billing", value: "1 Mar 2026", icon: Clock },
];

const recentTickets = [
  { id: "TKT-1042", subject: "VPN connectivity issue", status: "Open", date: "7 Feb 2026" },
  { id: "TKT-1039", subject: "Backup job failed on Server-03", status: "In Progress", date: "5 Feb 2026" },
  { id: "TKT-1035", subject: "New user onboarding request", status: "Resolved", date: "2 Feb 2026" },
];

const statusColor = (s: string) => {
  if (s === "Open") return "bg-foreground text-background";
  if (s === "In Progress") return "bg-muted-foreground text-background";
  return "bg-muted text-muted-foreground";
};

const PortalDashboard = () => (
  <div className="space-y-8">
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
      <h2 className="font-display text-2xl font-bold text-foreground mb-1">Welcome back, Alex</h2>
      <p className="text-sm text-muted-foreground">Here's an overview of your account.</p>
    </motion.div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <motion.div key={s.label} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
          <Card>
            <CardContent className="p-5 flex items-start gap-4">
              <div className="p-2.5 bg-secondary rounded">
                <s.icon size={20} className="text-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="font-display text-xl font-bold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>

    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTickets.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{t.subject}</p>
                  <p className="text-xs text-muted-foreground">{t.id} · {t.date}</p>
                </div>
                <Badge className={statusColor(t.status)}>{t.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  </div>
);

export default PortalDashboard;
