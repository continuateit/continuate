import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const PortalAccount = () => (
  <div className="space-y-8 max-w-3xl">
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
      <h2 className="font-display text-2xl font-bold text-foreground mb-1">Account Settings</h2>
      <p className="text-sm text-muted-foreground">Manage your profile and preferences.</p>
    </motion.div>

    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input defaultValue="Alex Johnson" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue="alex@retailfirm.co.za" type="email" />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input defaultValue="Retail Firm (Pty) Ltd" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input defaultValue="+27 82 000 0000" />
            </div>
            <div className="sm:col-span-2">
              <Button type="button">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>

    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
          </div>
          <Button variant="outline" type="button">Update Password</Button>
        </CardContent>
      </Card>
    </motion.div>

    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Notifications</CardTitle>
          <Badge variant="outline">Email</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {["Ticket updates", "Billing reminders", "Service alerts", "Newsletter"].map((n) => (
            <label key={n} className="flex items-center justify-between py-2 border-b border-border last:border-0 cursor-pointer">
              <span className="text-sm text-foreground">{n}</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-foreground" />
            </label>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  </div>
);

export default PortalAccount;
