import { createClient } from "@supabase/supabase-js";
import PDFDocument from "pdfkit";

export const config = {
  maxDuration: 60,
  memory: 1024,
};

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const formatCurrency = (value, currency) => {
  const number = Number(value ?? 0);
  try {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: currency ?? "ZAR",
      maximumFractionDigits: 0,
    }).format(number);
  } catch {
    return `${currency ?? "ZAR"} ${number.toFixed(0)}`;
  }
};

const normalizeList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return value.split("\n").map((line) => line.trim()).filter(Boolean);
  return [];
};

const getBaseUrl = (req) => {
  const envBase = process.env.APP_BASE_URL;
  if (envBase) return envBase.replace(/\/$/, "");
  const host = req.headers.host;
  if (!host) return "";
  return `https://${host}`;
};

const buildPdf = ({ quote, items, acceptUrl, slaUrl }) =>
  new Promise((resolve) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    const currency = quote.currency ?? "ZAR";
    const assumptions = normalizeList(quote.assumptions);
    const terms = normalizeList(quote.terms);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const sectionTitle = (text) => {
      doc.moveDown(0.8);
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#111").text(text.toUpperCase());
      doc.moveDown(0.3);
    };

    doc.fontSize(10).fillColor("#111");
    doc.font("Helvetica-Bold").fontSize(16).text("CONTINUATE", { characterSpacing: 1 });
    doc.font("Helvetica").fontSize(11).text("IT Services");
    doc.font("Helvetica").fontSize(10).text("377 Rivonia Boulevard, Sandton, 2196");
    doc.text("info@continuate.co.za • 073 209 9100");
    doc.moveDown(0.6);

    doc.font("Helvetica-Bold").fontSize(16).text("Managed Security Services Proposal");
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(9).fillColor("#444");
    doc.text(`Client Name: ${quote.customer ?? "—"}`);
    doc.text(`Prepared By: Continuate IT Services`);
    doc.text(`Date: ${new Date().toLocaleDateString("en-ZA")}`);
    doc.text(`Proposal Reference #: ${quote.public_id}`);
    doc.text(`Contact: ${quote.contact_name ?? "—"} (${quote.contact_email ?? "—"})`);
    doc.text(`Owner: ${quote.owner ?? "—"}`);
    doc.text(`Expires: ${quote.expires_at ?? "—"}`);

    sectionTitle("Executive Summary");
    doc.font("Helvetica").fontSize(9).fillColor("#333");
    doc.text(
      `Continuate IT Services proposes delivering comprehensive Managed Security Services to protect ${
        quote.customer ?? "the client"
      } against evolving cyber threats. This proposal outlines the scope, service levels, pricing, and implementation approach tailored to your operational and compliance requirements.`,
      { width: pageWidth }
    );
    doc.moveDown(0.5);
    doc.text(
      "Our objective is to enhance your cybersecurity posture while ensuring business continuity and regulatory alignment.",
      { width: pageWidth }
    );

    sectionTitle("Client Overview");
    doc.text(`Client Organization: ${quote.customer ?? "—"}`, { width: pageWidth });
    doc.text(`Primary Contact: ${quote.contact_name ?? "—"}`, { width: pageWidth });
    doc.text("Industry: —", { width: pageWidth });
    doc.moveDown(0.2);
    doc.text("Current Environment Summary:", { width: pageWidth });
    ["Number of Users:", "Number of Endpoints:", "Servers (On-Prem / Cloud):", "Cloud Platforms:", "Compliance Requirements:"].forEach(
      (line) => doc.text(`• ${line}`, { width: pageWidth })
    );

    sectionTitle("Scope of Services");
    doc.font("Helvetica-Bold").text("Core MSSP Services", { width: pageWidth });
    doc.font("Helvetica").fontSize(9);
    [
      "24/7 Security Monitoring (SOC)",
      "Managed Endpoint Detection & Response (EDR/XDR)",
      "Firewall & Network Security Management",
      "SIEM Monitoring & Log Analysis",
      "Threat Intelligence & Threat Hunting",
      "Incident Response Management",
      "Vulnerability Scanning & Reporting",
      "Patch Management Oversight",
    ].forEach((item) => doc.text(`• ${item}`, { width: pageWidth }));

    doc.moveDown(0.4);
    doc.font("Helvetica-Bold").text("Optional Add-On Services", { width: pageWidth });
    doc.font("Helvetica").fontSize(9);
    [
      "Managed Email Security",
      "Dark Web Monitoring",
      "Security Awareness Training",
      "Compliance Reporting & Audit Support",
      "Penetration Testing",
      "Cloud Security Posture Management",
      "Backup & Disaster Recovery",
    ].forEach((item) => doc.text(`• ${item}`, { width: pageWidth }));

    sectionTitle("Service Levels");
    doc.font("Helvetica-Bold").text("Response Times", { width: pageWidth });
    doc.font("Helvetica").fontSize(9);
    [
      "Critical: < 1 Hour response, 4–8 Hours resolution target",
      "High: < 4 Hours response, 24 Hours resolution target",
      "Medium: < 8 Hours response, 2–3 Business Days resolution target",
      "Low: 1 Business Day response, As Scheduled resolution target",
    ].forEach((line) => doc.text(`• ${line}`, { width: pageWidth }));
    doc.moveDown(0.4);
    doc.font("Helvetica-Bold").text("Monitoring Coverage", { width: pageWidth });
    doc.font("Helvetica").fontSize(9);
    ["24/7/365 SOC Monitoring", "Automated Threat Detection", "Real-Time Alerting"].forEach((line) =>
      doc.text(`• ${line}`, { width: pageWidth })
    );

    sectionTitle("Implementation Plan");
    doc.font("Helvetica-Bold").text("Phase 1 – Assessment & Discovery", { width: pageWidth });
    doc.font("Helvetica").fontSize(9);
    ["Environment review", "Risk analysis", "Security gap identification"].forEach((line) =>
      doc.text(`• ${line}`, { width: pageWidth })
    );
    doc.moveDown(0.4);
    doc.font("Helvetica-Bold").text("Phase 2 – Deployment", { width: pageWidth });
    doc.font("Helvetica").fontSize(9);
    ["Agent installation", "Firewall integration", "Log ingestion configuration", "Baseline security hardening"].forEach(
      (line) => doc.text(`• ${line}`, { width: pageWidth })
    );
    doc.moveDown(0.4);
    doc.font("Helvetica-Bold").text("Phase 3 – Monitoring & Optimization", { width: pageWidth });
    doc.font("Helvetica").fontSize(9);
    ["Continuous monitoring", "Monthly security reporting", "Quarterly strategy review"].forEach((line) =>
      doc.text(`• ${line}`, { width: pageWidth })
    );
    doc.moveDown(0.3);
    doc.text("Estimated Implementation Timeline: 2–6 Weeks", { width: pageWidth });

    sectionTitle("Reporting & Communication");
    [
      "Monthly Security Summary Report",
      "Incident Reports (as required)",
      "Quarterly Security Review Meeting",
      "Dedicated Account Manager",
      "24/7 Emergency Contact",
    ].forEach((line) => doc.text(`• ${line}`, { width: pageWidth }));

    sectionTitle("Pricing Structure");
    doc.font("Helvetica-Bold").text("Managed Security Services Pricing", { width: pageWidth });
    doc.moveDown(0.2);
    const tableTop = doc.y;
    const colX = [40, 250, 350, 430, 510];
    doc.fontSize(9).fillColor("#555");
    doc.text("Service Component", colX[0], tableTop);
    doc.text("Quantity", colX[1], tableTop, { width: 80, align: "right" });
    doc.text("Unit Price", colX[2], tableTop, { width: 80, align: "right" });
    doc.text("Monthly Total", colX[3], tableTop, { width: 110, align: "right" });
    doc.moveDown(0.6);
    doc.strokeColor("#eee").moveTo(40, doc.y).lineTo(555, doc.y).stroke();

    doc.moveDown(0.4);
    doc.fillColor("#111").font("Helvetica").fontSize(9);
    if (!items?.length) {
      doc.text("No line items added.", 40, doc.y);
    } else {
      items.forEach((item) => {
        const total = Number(item.unit_price ?? 0) * Number(item.quantity ?? 0);
        doc.text(item.name ?? "Service", colX[0], doc.y, { width: 200 });
        doc.text(String(item.quantity ?? 0), colX[1], doc.y, { width: 80, align: "right" });
        doc.text(formatCurrency(item.unit_price ?? 0, currency), colX[2], doc.y, {
          width: 80,
          align: "right",
        });
        doc.text(formatCurrency(total, currency), colX[3], doc.y, { width: 110, align: "right" });
        doc.moveDown(0.8);
      });
    }

    doc.moveDown(0.3);
    doc.strokeColor("#eee").moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(10);
    doc.text("Total Monthly Recurring Cost", 320, doc.y, { width: 180, align: "right" });
    doc.text(formatCurrency(quote.total ?? 0, currency), 510, doc.y, { width: 80, align: "right" });
    doc.moveDown(0.4);
    doc.font("Helvetica").fontSize(9).fillColor("#555");
    doc.text("One-Time Setup Fee: Included", 320, doc.y, { width: 270, align: "right" });

    sectionTitle("Contract Terms");
    doc.font("Helvetica").fontSize(9);
    [
      "Agreement Term: 12 / 24 / 36 Months",
      "Billing Frequency: Monthly",
      "Auto-Renewal: Yes / No",
      "Termination Clause: As per master services agreement",
    ].forEach((line) => doc.text(`• ${line}`, { width: pageWidth }));

    sectionTitle("Assumptions & Exclusions");
    if (assumptions.length) {
      assumptions.forEach((a) => doc.text(`• ${a}`, { width: pageWidth }));
    } else {
      [
        "Client provides required administrative access.",
        "Internet connectivity maintained at all monitored locations.",
        "Hardware upgrades not included unless specified.",
        "Third-party licensing costs not included unless stated.",
      ].forEach((line) => doc.text(`• ${line}`, { width: pageWidth }));
    }

    sectionTitle("Security & Compliance Commitment");
    [
      "NIST Cybersecurity Framework",
      "ISO 27001 Controls",
      "CIS Benchmarks",
      "Applicable data protection standards",
    ].forEach((line) => doc.text(`• ${line}`, { width: pageWidth }));

    sectionTitle("Coverage & Eligibility");
    doc.text(
      "All devices are covered as long as Continuate can connect to the device or environment remotely.",
      { width: pageWidth }
    );

    sectionTitle("Pricing Notes");
    [
      "All prices are exclusive of VAT.",
      "No surprise charges: all inclusions and billable extras are defined upfront.",
      "Included service categories: Infrastructure Management, Remote Monitoring & Management, Maintenance, End-user Support.",
      "Additional services are quoted and approved before work begins.",
    ].forEach((line) => doc.text(`• ${line}`, { width: pageWidth }));

    sectionTitle("Acceptance");
    doc.text("Client Representative: ____________________________", { width: pageWidth });
    doc.text("Name: ____________________________", { width: pageWidth });
    doc.text("Title: ____________________________", { width: pageWidth });
    doc.text("Signature: ________________________  Date: ____________", { width: pageWidth });
    doc.moveDown(0.6);
    doc.text("Continuate IT Services Representative: ____________________", { width: pageWidth });
    doc.text("Name: ____________________________", { width: pageWidth });
    doc.text("Title: ____________________________", { width: pageWidth });
    doc.text("Signature: ________________________  Date: ____________", { width: pageWidth });

    sectionTitle("Next Steps");
    doc.font("Helvetica").fontSize(9);
    if (acceptUrl) {
      doc.fillColor("#111").text("Accept this quote online: ", { continued: true });
      doc.fillColor("#0a58ca").text(acceptUrl, { link: acceptUrl, underline: true });
    } else {
      doc.text("Accept this quote online at the link provided by your account manager.");
    }
    if (slaUrl) {
      doc.moveDown(0.4);
      doc.fillColor("#111").text("View SLA online: ", { continued: true });
      doc.fillColor("#0a58ca").text(slaUrl, { link: slaUrl, underline: true });
    }

    doc.moveDown(1.1);
    doc.font("Helvetica").fontSize(8).fillColor("#666");
    doc.text(`Continuate IT Services • ${new Date().toLocaleDateString("en-ZA")}`);

    doc.end();
  });

const getUserAndRole = async (token) => {
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    throw new Error("Unauthorized");
  }
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("auth_user_id", data.user.id)
    .maybeSingle();
  if (profileError) throw profileError;
  if (profile?.role !== "admin") {
    throw new Error("Forbidden");
  }
  return data.user;
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }
    const token = authHeader.replace("Bearer ", "");
    await getUserAndRole(token);

    const { quoteId } = req.body ?? {};
    if (!quoteId) {
      return res.status(400).json({ error: "quoteId is required" });
    }

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("*")
      .eq("public_id", quoteId)
      .single();
    if (quoteError || !quote) {
      return res.status(404).json({ error: "Quote not found" });
    }

    const { data: items, error: itemsError } = await supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", quote.id);
    if (itemsError) {
      throw itemsError;
    }

    const appBaseUrl = getBaseUrl(req);
    const acceptUrl = appBaseUrl ? `${appBaseUrl}/quote/${quote.public_id}/accept` : "";
    const slaUrl = quote.sla_url ?? (appBaseUrl ? `${appBaseUrl}/sla/${quote.public_id}` : "");
    const pdf = await buildPdf({ quote, items, acceptUrl, slaUrl });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Continuate-Quote-${quote.public_id}.pdf"`
    );
    return res.status(200).send(pdf);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate PDF";
    return res.status(500).json({ error: message });
  }
}
