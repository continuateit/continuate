import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search } from "lucide-react";

const tickets = [
  { id: "TKT-1042", subject: "VPN connectivity issue", category: "Networking", priority: "High", status: "Open", created: "7 Feb 2026", updated: "8 Feb 2026" },
  { id: "TKT-1039", subject: "Backup job failed on Server-03", category: "Backups", priority: "Medium", status: "In Progress", created: "5 Feb 2026", updated: "7 Feb 2026" },
  { id: "TKT-1035", subject: "New user onboarding request", category: "General", priority: "Low", status: "Resolved", created: "2 Feb 2026", updated: "4 Feb 2026" },
  { id: "TKT-1030", subject: "Firewall rule update needed", category: "Cybersecurity", priority: "High", status: "Resolved", created: "28 Jan 2026", updated: "30 Jan 2026" },
  { id: "TKT-1025", subject: "CCTV camera offline — Building B", category: "CCTV", priority: "Medium", status: "Resolved", created: "22 Jan 2026", updated: "23 Jan 2026" },
];

const statusColor = (s: string) => {
  if (s === "Open") return "bg-foreground text-background";
  if (s === "In Progress") return "bg-muted-foreground text-background";
  return "bg-muted text-muted-foreground";
};

const priorityStyle = (p: string) => {
  if (p === "High") return "text-foreground font-semibold";
  if (p === "Medium") return "text-muted-foreground font-medium";
  return "text-muted-foreground";
};

const PortalHelpdesk = () => {
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = tickets.filter(
    (t) =>
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-1">Helpdesk</h2>
          <p className="text-sm text-muted-foreground">Submit and track support tickets.</p>
        </div>
        <Button onClick={() => setShowNew(!showNew)} className="gap-2">
          <Plus size={16} /> New Ticket
        </Button>
      </motion.div>

      {showNew && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Create New Ticket</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input placeholder="Brief description of the issue" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option>Networking</option>
                    <option>Cybersecurity</option>
                    <option>Backups</option>
                    <option>CCTV</option>
                    <option>Hardware</option>
                    <option>General</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Attachment</Label>
                  <Input type="file" />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label>Description</Label>
                  <textarea className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Detailed description..." />
                </div>
                <div className="sm:col-span-2">
                  <Button type="button" onClick={() => setShowNew(false)}>Submit Ticket</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Tabs defaultValue="all">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        {["all", "open", "resolved"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead className="hidden md:table-cell">Category</TableHead>
                      <TableHead className="hidden sm:table-cell">Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered
                      .filter((t) => {
                        if (tab === "open") return t.status !== "Resolved";
                        if (tab === "resolved") return t.status === "Resolved";
                        return true;
                      })
                      .map((t) => (
                        <TableRow key={t.id} className="cursor-pointer">
                          <TableCell className="font-mono text-xs text-muted-foreground">{t.id}</TableCell>
                          <TableCell className="font-medium text-foreground">{t.subject}</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">{t.category}</TableCell>
                          <TableCell className={`hidden sm:table-cell ${priorityStyle(t.priority)}`}>{t.priority}</TableCell>
                          <TableCell><Badge className={statusColor(t.status)}>{t.status}</Badge></TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">{t.updated}</TableCell>
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

export default PortalHelpdesk;
