import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check } from "lucide-react";

const currentPlan = {
  name: "Professional",
  price: "R5,500",
  period: "/month",
  features: ["NOC/SOC Monitoring", "Cybersecurity Suite", "Daily Backups", "Priority Support", "Up to 50 Devices"],
  addOns: [
    { name: "CCTV Monitoring", price: "R800/mo", active: true },
    { name: "Biometric Access", price: "R500/mo", active: false },
    { name: "Hardware Warranty+", price: "R350/mo", active: true },
  ],
};

const invoices = [
  { id: "INV-2026-02", date: "1 Feb 2026", amount: "R6,650", status: "Paid" },
  { id: "INV-2026-01", date: "1 Jan 2026", amount: "R6,650", status: "Paid" },
  { id: "INV-2025-12", date: "1 Dec 2025", amount: "R6,300", status: "Paid" },
  { id: "INV-2025-11", date: "1 Nov 2025", amount: "R6,300", status: "Paid" },
];

const PortalSubscriptions = () => (
  <div className="space-y-8">
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
      <h2 className="font-display text-2xl font-bold text-foreground mb-1">Subscriptions</h2>
      <p className="text-sm text-muted-foreground">Manage your plan, add-ons, and billing.</p>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Current Plan */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Current Plan</CardTitle>
            <Badge className="bg-foreground text-background">Active</Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="font-display text-3xl font-bold text-foreground">{currentPlan.price}</span>
              <span className="text-muted-foreground text-sm">{currentPlan.period}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
              {currentPlan.features.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <Check size={14} className="text-muted-foreground" /> {f}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">Upgrade Plan</Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add-Ons */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add-Ons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentPlan.addOns.map((a) => (
              <div key={a.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.price}</p>
                </div>
                <Badge variant={a.active ? "default" : "outline"} className={a.active ? "bg-foreground text-background" : ""}>
                  {a.active ? "Active" : "Add"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>

    {/* Billing History */}
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium text-foreground">{inv.id}</TableCell>
                  <TableCell className="text-muted-foreground">{inv.date}</TableCell>
                  <TableCell className="text-foreground">{inv.amount}</TableCell>
                  <TableCell><Badge variant="outline">{inv.status}</Badge></TableCell>
                  <TableCell><Button variant="ghost" size="sm">Download</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  </div>
);

export default PortalSubscriptions;
