import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const kpis = [
  { label: "Monthly Revenue", value: "R702,000", change: "+12%" },
  { label: "Avg. Response Time", value: "2.4h", change: "-18%" },
  { label: "Resolution Rate", value: "94%", change: "+3%" },
  { label: "Client Satisfaction", value: "4.7/5", change: "+0.2" },
  { label: "New Clients (Month)", value: "8", change: "+60%" },
  { label: "Churn Rate", value: "2.1%", change: "-0.5%" },
];

const topIssues = [
  { category: "Networking", count: 34, pct: "28%" },
  { category: "Cybersecurity", count: 28, pct: "23%" },
  { category: "Backups", count: 22, pct: "18%" },
  { category: "CCTV", count: 15, pct: "12%" },
  { category: "Hardware", count: 12, pct: "10%" },
  { category: "General", count: 11, pct: "9%" },
];

const AdminReports = () => (
  <div className="space-y-8">
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
      <h2 className="font-display text-2xl font-bold text-foreground mb-1">Reports & Analytics</h2>
      <p className="text-sm text-muted-foreground">Key performance metrics for the current period.</p>
    </motion.div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {kpis.map((k, i) => (
        <motion.div key={k.label} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{k.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="font-display text-2xl font-bold text-foreground">{k.value}</p>
                <Badge variant="outline" className="text-xs">{k.change}</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>

    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Issue Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topIssues.map((issue) => (
              <div key={issue.category} className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground w-28">{issue.category}</span>
                <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-foreground rounded-full" style={{ width: issue.pct }} />
                </div>
                <span className="text-xs text-muted-foreground w-16 text-right">{issue.count} tickets</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  </div>
);

export default AdminReports;
