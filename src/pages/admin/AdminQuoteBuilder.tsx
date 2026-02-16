import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { fadeUp } from "@/lib/animations";
import { serviceCatalog } from "@/data/quotes";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Send, FileText, Database, Shield } from "lucide-react";
import { createQuote, downloadQuotePdf, sendQuote } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminQuoteBuilder = () => {
  const { toast } = useToast();
  const [currency, setCurrency] = useState("ZAR");
  const [exchangeRate, setExchangeRate] = useState(() => {
    const raw = import.meta.env.VITE_ZAR_USD_RATE;
    const parsed = raw ? Number(raw) : NaN;
    return Number.isNaN(parsed) ? 18.5 : parsed;
  });
  const [items, setItems] = useState(
    serviceCatalog.map((item) => ({ ...item, selected: true })),
  );
  const [quoteName, setQuoteName] = useState("Summit Capital SLA + MSSP Program");
  const [customer, setCustomer] = useState("Summit Capital Group");
  const [contactName, setContactName] = useState("Taylor Brooks");
  const [contactEmail, setContactEmail] = useState("taylor@summitcap.com");
  const [region, setRegion] = useState("US-East");
  const [owner, setOwner] = useState("Sophie Grant");
  const [expiresAt, setExpiresAt] = useState("2026-03-20");
  const [summary, setSummary] = useState(
    "Continuate will deliver a unified IT SLA + MSSP program covering 24/7 monitoring, rapid incident response, and compliance reporting for Summit Capital's critical workloads.",
  );
  const [assumptionOne, setAssumptionOne] = useState(
    "Client grants access to endpoint and network telemetry within 10 business days.",
  );
  const [assumptionTwo, setAssumptionTwo] = useState(
    "Quarterly business reviews and KPI scorecards included.",
  );
  const [assumptionThree, setAssumptionThree] = useState(
    "Monthly billing in arrears via ACH; annual renewal with 3% uplift.",
  );
  const [termsOne, setTermsOne] = useState("12-month term with annual renewal option.");
  const [termsTwo, setTermsTwo] = useState("Service credits apply after SLA breach review.");

  const convert = (amount: number) => {
    if (currency === "USD") {
      return exchangeRate > 0 ? amount / exchangeRate : amount;
    }
    return amount;
  };

  const total = useMemo(
    () =>
      items
        .filter((item) => item.selected)
        .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [items],
  );

  const basePayload = {
    name: quoteName,
    customer,
    contactName,
    contactEmail,
    region,
    owner,
    expiresAt,
    currency,
    assumptions: [summary, assumptionOne, assumptionTwo, assumptionThree].filter(Boolean),
    terms: [termsOne, termsTwo].filter(Boolean),
    items: items.filter((item) => item.selected).map((item) => ({
      ...item,
      unitPrice: convert(item.unitPrice),
    })),
  };

  const handleCreateQuote = async (status: "Draft" | "Sent") => {
    try {
      const data = await createQuote({ ...basePayload, status });

      if (status === "Sent") {
        await sendQuote(data.id);
      }

      toast({
        title: status === "Sent" ? "Quote sent" : "Quote saved",
        description:
          status === "Sent"
            ? `Quote ${data.id} emailed via Mailjet.`
            : `Quote ${data.id} stored in Postgres.`,
      });
    } catch (error) {
      toast({
        title: "Quote action failed",
        description: "Check the API server and database connection.",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const handleGeneratePdf = async () => {
    try {
      const data = await createQuote({ ...basePayload, status: "Draft" });
      await downloadQuotePdf(data.id);
      toast({
        title: "PDF generated",
        description: `Quote ${data.id} downloaded.`,
      });
    } catch (error) {
      toast({
        title: "PDF generation failed",
        description: error instanceof Error ? error.message : "Unable to generate PDF.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-1">Create Quote</h2>
            <p className="text-sm text-muted-foreground">
              Compile SLA, MSSP, and cybersecurity services into a proposal and send a live link.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={handleGeneratePdf}>
              <FileText size={16} />Generate PDF
            </Button>
            <Button className="gap-2" onClick={() => handleCreateQuote("Sent")}><Send size={16} />Send Quote</Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer & Scope</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quoteName">Quote Name</Label>
                    <Input
                      id="quoteName"
                      placeholder="Proposal name"
                      value={quoteName}
                      onChange={(e) => setQuoteName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer</Label>
                    <Input
                      id="customer"
                      placeholder="Company name"
                      value={customer}
                      onChange={(e) => setCustomer(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact">Primary Contact</Label>
                    <Input
                      id="contact"
                      placeholder="Name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@company.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      placeholder="Region"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner">Owner</Label>
                    <Input
                      id="owner"
                      placeholder="Account owner"
                      value={owner}
                      onChange={(e) => setOwner(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiresAt">Expires At</Label>
                    <Input
                      id="expiresAt"
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="summary">Executive Summary</Label>
                  <Textarea
                    id="summary"
                    rows={4}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Service Catalog</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {serviceCatalog.map((service) => (
                  <div key={service.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={items.find((item) => item.id === service.id)?.selected ?? false}
                        onCheckedChange={(checked) =>
                          setItems((prev) =>
                            prev.map((item) =>
                              item.id === service.id ? { ...item, selected: Boolean(checked) } : item,
                            ),
                          )
                        }
                        id={`service-${service.id}`}
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-foreground">{service.name}</p>
                          <Badge variant="outline">{service.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span>{service.slaTier}</span>
                          <span>-</span>
                          <span>{service.kpiTags.join(" | ")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm space-y-2">
                      <p className="font-medium text-foreground">
                        {formatCurrency(convert(service.unitPrice), currency)} {service.unit}
                      </p>
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-muted-foreground">Qty</span>
                        <Input
                          type="number"
                          min={0}
                          value={items.find((item) => item.id === service.id)?.quantity ?? 0}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            setItems((prev) =>
                              prev.map((item) =>
                                item.id === service.id ? { ...item, quantity: Number.isNaN(value) ? 0 : value } : item,
                              ),
                            );
                          }}
                          className="w-24 text-right"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Line total{" "}
                        {formatCurrency(
                          convert((items.find((item) => item.id === service.id)?.quantity ?? 0) * service.unitPrice),
                          currency,
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assumptions & Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea rows={3} value={assumptionOne} onChange={(e) => setAssumptionOne(e.target.value)} />
                <Textarea rows={3} value={assumptionTwo} onChange={(e) => setAssumptionTwo(e.target.value)} />
                <Textarea rows={3} value={assumptionThree} onChange={(e) => setAssumptionThree(e.target.value)} />
                <Separator />
                <Textarea rows={2} value={termsOne} onChange={(e) => setTermsOne(e.target.value)} />
                <Textarea rows={2} value={termsTwo} onChange={(e) => setTermsTwo(e.target.value)} />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Totals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ZAR">ZAR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Pricing is based in ZAR; USD is shown for reference.</p>
                </div>
                {currency === "USD" && (
                  <div className="space-y-2">
                    <Label>ZAR to USD Exchange Rate</Label>
                    <Input
                      type="number"
                      min={0.01}
                      step={0.01}
                      value={exchangeRate}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        setExchangeRate(Number.isNaN(value) ? 0 : value);
                      }}
                    />
                    <p className="text-xs text-muted-foreground">USD = ZAR ÷ rate.</p>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Services</span>
                  <span className="font-medium text-foreground">{formatCurrency(convert(total), currency)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">Estimated Monthly Total</span>
                  <span className="font-display text-xl font-bold text-foreground">
                    {formatCurrency(convert(total), currency)}
                  </span>
                </div>
                <Button className="w-full" variant="outline" onClick={() => handleCreateQuote("Draft")}>
                  Save Quote to Postgres
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Delivery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded bg-secondary text-secondary-foreground">
                    <Database size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Postgres Connected</p>
                    <p className="text-xs text-muted-foreground">Quote data syncs to the `quotes` table on save.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded bg-secondary text-secondary-foreground">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">PDF Proposal Attached</p>
                    <p className="text-xs text-muted-foreground">Attachment generated when the email is sent.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p className="text-foreground font-medium">Subject: Your Continuate SLA + MSSP Proposal</p>
                <p>Hi Taylor,</p>
                <p>
                  To accept and move forward, please use this link: https://continuate.io/quote/Q-2026-0215
                </p>
                <p>
                  The full PDF proposal is attached to this email for your records. The live view lets you review
                  services, KPIs, and SLA commitments.
                </p>
                <p>Thanks,</p>
                <p>Continuate Client Success</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminQuoteBuilder;
