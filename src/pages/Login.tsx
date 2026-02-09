import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login — navigate to portal
    navigate("/portal");
  };

  return (
    <section className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={0}
        className="w-full max-w-md mx-auto p-8 border border-border"
      >
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Sign In</h1>
        <p className="text-sm text-muted-foreground mb-8">Access your Continuate client portal</p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.co.za" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full">Sign In</Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Demo: <Link to="/portal" className="text-foreground underline">Client Portal</Link> · <Link to="/admin" className="text-foreground underline">Admin Dashboard</Link>
          </p>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to website
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default Login;
