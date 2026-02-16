import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { fetchQuote, type Quote } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const QuoteLiveView = () => {
  const { id } = useParams();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    fetchQuote(id)
      .then((data) => {
        if (!mounted) return;
        setQuote(data);
      })
      .catch(() => {
        if (!mounted) return;
        setQuote(null);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  const total = useMemo(
    () => (quote?.items ?? []).reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [quote],
  );

  const handleDownload = async () => {
    toast({
      title: "PDF not available yet",
      description: "PDF downloads are handled via email at the moment.",
    });
  };

  useEffect(() => {
    if (!quote?.dbId) return;
    supabase
      .from("quotes")
      .update({ viewed_at: new Date().toISOString() })
      .eq("id", quote.dbId)
      .then(() => {})
      .catch(() => {});
  }, [quote?.dbId]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading proposal…</div>;
  }

  if (!quote) {
    return <div className="text-sm text-muted-foreground">Quote not found.</div>;
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b border-border bg-background">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="/Continuate_logo.png" alt="Continuate" className="h-8 w-auto" />
            <Badge variant="outline">Live Proposal</Badge>
          </div>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/login"><UserPlus size={16} />Register account</Link>
          </Button>
        </div>
      </header>

      <main className="container py-10 space-y-8">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Quote {quote.id}</p>
              <h1 className="font-display text-3xl font-bold text-foreground">{quote.name}</h1>
              <p className="text-sm text-muted-foreground">Prepared for {quote.customer}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">{quote.status}</Badge>
              <Badge variant="outline">Expires {formatDate(quote.expiresAt)}</Badge>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Scope of Services</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead className="text-right">Monthly</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quote.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-foreground">{item.name}</div>
                              <div className="text-xs text-muted-foreground">{item.slaTier}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{item.quantity} {item.unit}</TableCell>
                          <TableCell className="text-right font-medium text-foreground">
                            {formatCurrency(item.quantity * item.unitPrice, quote.currency ?? "ZAR")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assumptions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  {(quote.assumptions ?? []).map((assumption) => (
                    <p key={assumption}>- {assumption}</p>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Terms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  {(quote.terms ?? []).map((term) => (
                    <p key={term}>- {term}</p>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Proposal Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Monthly Total</span>
                    <span className="font-medium text-foreground">{formatCurrency(total, quote.currency ?? "ZAR")}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Primary Contact</span>
                    <span className="text-foreground">{quote.contactName ?? quote.contactEmail ?? "—"}</span>
                  </div>
                  <Button asChild className="w-full">
                    <Link to={`/quote/${quote.id}/accept`}>Accept Proposal</Link>
                  </Button>
                  <Button variant="outline" className="w-full gap-2" onClick={handleDownload}>
                    <FileText size={16} />Download PDF Proposal
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Need an Account?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>Create a portal account to track support tickets, KPI reports, and invoices.</p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/login">Register account</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuoteLiveView;
