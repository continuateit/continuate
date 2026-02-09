import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

const tickets = [
  { id: "TKT-1042", subject: "VPN connectivity issue", client: "Alex Johnson", category: "Networking", priority: "High", status: "Open", assigned: "Thabo Nkosi", created: "7 Feb", sla: "4h" },
  { id: "TKT-1041", subject: "Email server lag", client: "Naledi Dube", category: "General", priority: "Medium", status: "Open", assigned: "Unassigned", created: "7 Feb", sla: "8h" },
  { id: "TKT-1039", subject: "Backup job failed — Server-03", client: "Alex Johnson", category: "Backups", priority: "Medium", status: "In Progress", assigned: "Thabo Nkosi", created: "5 Feb", sla: "—" },
  { id: "TKT-1037", subject: "Ransomware alert — false positive", client: "Sarah Mbeki", category: "Cybersecurity", priority: "High", status: "In Progress", assigned: "Admin", created: "4 Feb", sla: "—" },
  { id: "TKT-1035", subject: "New user onboarding request", client: "Alex Johnson", category: "General", priority: "Low", status: "Resolved", assigned: "Thabo Nkosi", created: "2 Feb", sla: "—" },
  { id: "TKT-1030", subject: "Firewall rule update needed", client: "James van Wyk", category: "Cybersecurity", priority: "High", status: "Resolved", assigned: "Admin", created: "28 Jan", sla: "—" },
];

const statusColor = (s: string) => {
  if (s === "Open") return "bg-foreground text-background";
  if (s === "In Progress") return "bg-muted-foreground text-background";
  return "bg-muted text-muted-foreground";
};

const AdminTickets = () => {
  const [search, setSearch] = useState("");
  const filtered = tickets.filter(
    (t) =>
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.client.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">Ticket Management</h2>
        <p className="text-sm text-muted-foreground">{tickets.filter((t) => t.status !== "Resolved").length} open · {tickets.length} total</p>
      </motion.div>

      <Tabs defaultValue="all">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="progress">In Progress</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        {["all", "open", "progress", "resolved"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead className="hidden md:table-cell">Client</TableHead>
                      <TableHead className="hidden lg:table-cell">Assigned</TableHead>
                      <TableHead className="hidden sm:table-cell">Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">SLA</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered
                      .filter((t) => {
                        if (tab === "open") return t.status === "Open";
                        if (tab === "progress") return t.status === "In Progress";
                        if (tab === "resolved") return t.status === "Resolved";
                        return true;
                      })
                      .map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-mono text-xs text-muted-foreground">{t.id}</TableCell>
                          <TableCell className="font-medium text-foreground">{t.subject}</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">{t.client}</TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground">{t.assigned}</TableCell>
                          <TableCell className={`hidden sm:table-cell ${t.priority === "High" ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{t.priority}</TableCell>
                          <TableCell><Badge className={statusColor(t.status)}>{t.status}</Badge></TableCell>
                          <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{t.sla}</TableCell>
                          <TableCell><Button variant="ghost" size="sm">Manage</Button></TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AdminTickets;
