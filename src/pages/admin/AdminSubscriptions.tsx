import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const summary = [
  { label: "Essential", count: 42, mrr: "R105,000" },
  { label: "Professional", count: 58, mrr: "R319,000" },
  { label: "Enterprise", count: 28, mrr: "R278,000" },
];

const subscriptions = [
  { client: "Alex Johnson", company: "Retail Firm (Pty) Ltd", plan: "Professional", addOns: 2, mrr: "R6,650", status: "Active", renewal: "1 Mar 2026" },
  { client: "Sarah Mbeki", company: "Mbeki Manufacturing", plan: "Enterprise", addOns: 4, mrr: "R12,800", status: "Active", renewal: "15 Mar 2026" },
  { client: "James van Wyk", company: "FinTech Solutions", plan: "Essential", addOns: 1, mrr: "R3,300", status: "Active", renewal: "1 Mar 2026" },
  { client: "Naledi Dube", company: "Dube Logistics", plan: "Professional", addOns: 3, mrr: "R7,150", status: "Active", renewal: "10 Mar 2026" },
  { client: "Michael Chen", company: "Chen Imports", plan: "Essential", addOns: 0, mrr: "R2,500", status: "Cancelled", renewal: "—" },
  { client: "Priya Patel", company: "Patel & Associates", plan: "Professional", addOns: 1, mrr: "R6,300", status: "Active", renewal: "20 Mar 2026" },
];

const AdminSubscriptions = () => (
  <div className="space-y-8">
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
      <h2 className="font-display text-2xl font-bold text-foreground mb-1">Subscription Management</h2>
      <p className="text-sm text-muted-foreground">Overview of all client subscriptions and revenue.</p>
    </motion.div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {summary.map((s, i) => (
        <motion.div key={s.label} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{s.label}</p>
              <p className="font-display text-2xl font-bold text-foreground">{s.count} clients</p>
              <p className="text-sm text-muted-foreground mt-1">MRR: {s.mrr}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>

    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead className="hidden md:table-cell">Company</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="hidden sm:table-cell">Add-Ons</TableHead>
                <TableHead>MRR</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Renewal</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((s) => (
                <TableRow key={s.client}>
                  <TableCell>
                    <p className="font-medium text-foreground">{s.client}</p>
                    <p className="text-xs text-muted-foreground md:hidden">{s.company}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{s.company}</TableCell>
                  <TableCell><Badge variant="outline">{s.plan}</Badge></TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{s.addOns}</TableCell>
                  <TableCell className="font-medium text-foreground">{s.mrr}</TableCell>
                  <TableCell>
                    <Badge className={s.status === "Active" ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}>
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">{s.renewal}</TableCell>
                  <TableCell><Button variant="ghost" size="sm">Manage</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  </div>
);

export default AdminSubscriptions;
