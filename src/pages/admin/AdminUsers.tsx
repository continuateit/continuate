import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, UserPlus } from "lucide-react";

const users = [
  { id: "USR-001", name: "Alex Johnson", company: "Retail Firm (Pty) Ltd", plan: "Professional", devices: 24, status: "Active" },
  { id: "USR-002", name: "Sarah Mbeki", company: "Mbeki Manufacturing", plan: "Enterprise", devices: 68, status: "Active" },
  { id: "USR-003", name: "James van Wyk", company: "FinTech Solutions", plan: "Essential", devices: 12, status: "Active" },
  { id: "USR-004", name: "Naledi Dube", company: "Dube Logistics", plan: "Professional", devices: 35, status: "Active" },
  { id: "USR-005", name: "Michael Chen", company: "Chen Imports", plan: "Essential", devices: 8, status: "Suspended" },
  { id: "USR-006", name: "Priya Patel", company: "Patel & Associates", plan: "Professional", devices: 19, status: "Active" },
];

const AdminUsers = () => {
  const [search, setSearch] = useState("");
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-1">User Management</h2>
          <p className="text-sm text-muted-foreground">{users.length} registered clients</p>
        </div>
        <Button className="gap-2"><UserPlus size={16} /> Add Client</Button>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
        <div className="relative w-full sm:w-72 mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">Company</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="hidden sm:table-cell">Devices</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{u.name}</p>
                        <p className="text-xs text-muted-foreground md:hidden">{u.company}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{u.company}</TableCell>
                    <TableCell><Badge variant="outline">{u.plan}</Badge></TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{u.devices}</TableCell>
                    <TableCell>
                      <Badge className={u.status === "Active" ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}>
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell><Button variant="ghost" size="sm">View</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminUsers;
