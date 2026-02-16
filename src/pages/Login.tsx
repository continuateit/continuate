import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { session, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      const fallback = isAdmin ? "/admin" : "/portal";
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? fallback, { replace: true });
    }
  }, [session, isAdmin, location.state, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: fullName || email,
          company: company || null,
        },
      },
    });
    setLoading(false);
    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (data.session) {
      toast({
        title: "Account created",
        description: "Your account is ready. Redirecting you to the portal.",
      });
      return;
    }

    toast({
      title: "Check your email",
      description: "Confirm your email address to activate your account.",
    });
  };

  const handleOAuth = async (provider: "google" | "azure") => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    });
    if (error) {
      setLoading(false);
      toast({
        title: "SSO failed",
        description: error.message,
        variant: "destructive",
      });
    }
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
        <div className="flex items-center gap-3 mb-6">
          <picture>
            <source srcSet="/logo-light.png" media="(prefers-color-scheme: dark)" />
            <img src="/logo-dark.png" alt="Continuate" className="h-10 w-auto" />
          </picture>
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          {mode === "signin" ? "Sign In" : "Create Account"}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {mode === "signin" ? "Access your Continuate client portal" : "Create your Continuate client account"}
        </p>

        <div className="flex items-center gap-2 bg-secondary p-1 rounded-full mb-6">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 text-xs uppercase tracking-[0.25em] py-2 rounded-full transition ${
              mode === "signin" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 text-xs uppercase tracking-[0.25em] py-2 rounded-full transition ${
              mode === "signup" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-6">
          <Button type="button" variant="outline" onClick={() => handleOAuth("google")} disabled={loading}>
            Continue with Google
          </Button>
          <Button type="button" variant="outline" onClick={() => handleOAuth("azure")} disabled={loading}>
            Continue with Microsoft
          </Button>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-6">
          <span className="flex-1 border-t border-border" />
          <span>or</span>
          <span className="flex-1 border-t border-border" />
        </div>

        <form onSubmit={mode === "signin" ? handleLogin : handleSignup} className="space-y-5">
          {mode === "signup" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company name"
                />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.co.za" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Need help? Contact Continuate support.
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
