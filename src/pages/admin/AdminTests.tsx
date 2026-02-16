import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type TestStatus = "idle" | "running" | "pass" | "fail";

type TestResult = {
  status: TestStatus;
  message?: string;
};

const AdminTests = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [quoteId, setQuoteId] = useState("");
  const [dryRun, setDryRun] = useState(true);
  const [loadingQuote, setLoadingQuote] = useState(false);

  const envSummary = useMemo(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    const adminEmails = import.meta.env.VITE_ADMIN_EMAILS as string | undefined;
    const exchangeRate = import.meta.env.VITE_ZAR_USD_RATE as string | undefined;
    return {
      supabaseUrl: supabaseUrl ?? "Missing",
      anonKey: anonKey ? `${anonKey.slice(0, 6)}…${anonKey.slice(-4)}` : "Missing",
      adminEmails: adminEmails ?? "Missing",
      exchangeRate: exchangeRate ?? "Missing",
    };
  }, []);

  const setResult = (id: string, patch: TestResult) => {
    setResults((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const run = async (id: string, runner: () => Promise<string>) => {
    setResult(id, { status: "running", message: "Running..." });
    try {
      const message = await runner();
      setResult(id, { status: "pass", message });
    } catch (error) {
      setResult(id, {
        status: "fail",
        message: error instanceof Error ? error.message : "Test failed",
      });
    }
  };

  const statusBadge = (status: TestStatus) => {
    if (status === "pass") return <Badge variant="outline" className="text-emerald-600 border-emerald-200">Pass</Badge>;
    if (status === "fail") return <Badge variant="outline" className="text-red-600 border-red-200">Fail</Badge>;
    if (status === "running") return <Badge variant="secondary">Running</Badge>;
    return <Badge variant="outline">Idle</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">Admin Test Center</h2>
        <p className="text-sm text-muted-foreground">Validate Supabase, auth, database schema, and edge functions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Environment</CardTitle>
          <CardDescription>Values loaded into the client build.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Supabase URL</div>
            <div className="font-medium text-foreground break-all">{envSummary.supabaseUrl}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Anon Key</div>
            <div className="font-medium text-foreground">{envSummary.anonKey}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Admin Emails</div>
            <div className="font-medium text-foreground">{envSummary.adminEmails}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">ZAR/USD Rate</div>
            <div className="font-medium text-foreground">{envSummary.exchangeRate}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Auth & Database</CardTitle>
          <CardDescription>Confirm the signed-in user, profile role, and schema.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm font-medium">Session</div>
              <div className="text-xs text-muted-foreground">Validates the auth session in the browser.</div>
            </div>
            <div className="flex items-center gap-3">
              {statusBadge(results.session?.status ?? "idle")}
              <Button
                variant="outline"
                onClick={() =>
                  run("session", async () => {
                    const { data, error } = await supabase.auth.getSession();
                    if (error) throw error;
                    const email = data.session?.user?.email;
                    if (!email) throw new Error("No active session found.");
                    return `Signed in as ${email}`;
                  })
                }
              >
                Run
              </Button>
            </div>
          </div>
          {results.session?.message && <div className="text-xs text-muted-foreground">{results.session.message}</div>}

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm font-medium">Profile Role</div>
              <div className="text-xs text-muted-foreground">Checks the profiles table for the current user.</div>
            </div>
            <div className="flex items-center gap-3">
              {statusBadge(results.profile?.status ?? "idle")}
              <Button
                variant="outline"
                onClick={() =>
                  run("profile", async () => {
                    if (!user?.email) throw new Error("No user email found.");
                    const { data, error } = await supabase
                      .from("profiles")
                      .select("role")
                      .eq("email", user.email)
                      .maybeSingle();
                    if (error) throw error;
                    if (!data) throw new Error("Profile row not found.");
                    return `Role: ${data.role ?? "none"} ${isAdmin ? "(admin in app)" : ""}`;
                  })
                }
              >
                Run
              </Button>
            </div>
          </div>
          {results.profile?.message && <div className="text-xs text-muted-foreground">{results.profile.message}</div>}

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm font-medium">Quotes Table</div>
              <div className="text-xs text-muted-foreground">Checks access and currency column.</div>
            </div>
            <div className="flex items-center gap-3">
              {statusBadge(results.quotes?.status ?? "idle")}
              <Button
                variant="outline"
                onClick={() =>
                  run("quotes", async () => {
                    const { error } = await supabase.from("quotes").select("currency").limit(1);
                    if (error) throw error;
                    return "Quotes table reachable, currency column available.";
                  })
                }
              >
                Run
              </Button>
            </div>
          </div>
          {results.quotes?.message && <div className="text-xs text-muted-foreground">{results.quotes.message}</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Edge Functions</CardTitle>
          <CardDescription>Use a real quote ID to test PDF generation and sending.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-end gap-3">
            <div className="flex-1">
              <label className="text-xs uppercase tracking-wide text-muted-foreground">Quote Public ID</label>
              <Input
                value={quoteId}
                onChange={(event) => setQuoteId(event.target.value)}
                placeholder="e.g. Q-24ABC123"
              />
            </div>
            <Button
              variant="outline"
              disabled={loadingQuote}
              onClick={async () => {
                try {
                  setLoadingQuote(true);
                  const { data, error } = await supabase
                    .from("quotes")
                    .select("public_id")
                    .order("created_at", { ascending: false })
                    .limit(1);
                  if (error) throw error;
                  if (!data || data.length === 0) throw new Error("No quotes found.");
                  setQuoteId(data[0].public_id ?? "");
                  toast({ title: "Latest quote loaded", description: data[0].public_id ?? "Missing public ID" });
                } catch (error) {
                  toast({
                    title: "Could not load quote",
                    description: error instanceof Error ? error.message : "Failed to fetch latest quote.",
                    variant: "destructive",
                  });
                } finally {
                  setLoadingQuote(false);
                }
              }}
            >
              {loadingQuote ? "Loading..." : "Use Latest Quote"}
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Checkbox
              id="dry-run"
              checked={dryRun}
              onCheckedChange={(value) => setDryRun(Boolean(value))}
            />
            <label htmlFor="dry-run" className="text-sm text-muted-foreground">
              Dry run (skip sending email, just verify the function)
            </label>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm font-medium">quote-pdf</div>
              <div className="text-xs text-muted-foreground">Generates the PDF base64 for a quote.</div>
            </div>
            <div className="flex items-center gap-3">
              {statusBadge(results.quotePdf?.status ?? "idle")}
              <Button
                variant="outline"
                onClick={() =>
                  run("quotePdf", async () => {
                    if (!quoteId.trim()) throw new Error("Enter a quote public ID first.");
                    const { data, error } = await supabase.functions.invoke("quote-pdf", {
                      body: { quoteId: quoteId.trim() },
                    });
                    if (error) throw error;
                    const size = data?.base64?.length ?? 0;
                    if (!size) throw new Error("No PDF data returned.");
                    return `PDF generated (${size} base64 chars).`;
                  })
                }
              >
                Run
              </Button>
            </div>
          </div>
          {results.quotePdf?.message && <div className="text-xs text-muted-foreground">{results.quotePdf.message}</div>}

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm font-medium">send-quote</div>
              <div className="text-xs text-muted-foreground">Sends the quote email through Mailjet.</div>
            </div>
            <div className="flex items-center gap-3">
              {statusBadge(results.sendQuote?.status ?? "idle")}
              <Button
                variant="outline"
                onClick={() =>
                  run("sendQuote", async () => {
                    if (!quoteId.trim()) throw new Error("Enter a quote public ID first.");
                    const { data, error } = await supabase.functions.invoke("send-quote", {
                      body: { quoteId: quoteId.trim(), dryRun },
                    });
                    if (error) throw error;
                    if (!data?.ok) throw new Error("Function did not return ok.");
                    return dryRun ? "Dry run complete." : "Send request completed.";
                  })
                }
              >
                Run
              </Button>
            </div>
          </div>
          {results.sendQuote?.message && <div className="text-xs text-muted-foreground">{results.sendQuote.message}</div>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTests;
