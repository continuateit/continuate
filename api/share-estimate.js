import { createClient } from "@supabase/supabase-js";
import mailjet from "node-mailjet";
import { buildPdf } from "./_pdf.js";

export const config = {
  maxDuration: 60,
  memory: 1024,
};

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const mailjetKey = process.env.MAILJET_API_KEY;
const mailjetSecret = process.env.MAILJET_API_SECRET;
const mailjetFromEmail = process.env.MAILJET_FROM_EMAIL;
const mailjetFromName = process.env.MAILJET_FROM_NAME ?? "Continuate IT Services";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const getBaseUrl = (req) => {
  const envBase = process.env.APP_BASE_URL;
  if (envBase) return envBase.replace(/\/$/, "");
  const host = req.headers.host;
  if (!host) return "";
  return `https://${host}`;
};

const loadLogo = async (baseUrl, path) => {
  if (!baseUrl) return null;
  try {
    const response = await fetch(`${baseUrl}${path}`);
    if (!response.ok) return null;
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
  } catch {
    return null;
  }
};

const calculateEstimate = ({ devices, cybersecurity, backup }) => {
  const baseRate = 220;
  const cybersecurityRate = 125;
  const backupRate = 75;
  let base = devices * baseRate;
  if (cybersecurity) base += devices * cybersecurityRate;
  if (backup) base += devices * backupRate;
  const low = Math.round((base * 0.85) / 100) * 100;
  const high = Math.round((base * 1.15) / 100) * 100;
  return { subtotal: base, total: base, low, high };
};

const buildItems = ({ devices, cybersecurity, backup }) => {
  const items = [
    {
      name: "Managed IT Support",
      category: "Managed Services",
      description: "24/7 monitoring, remote support, patch management",
      unit: "device",
      quantity: devices,
      unit_price: 220,
      sla_tier: "Standard response",
      kpi_tags: ["Uptime", "Patch compliance"],
    },
  ];
  if (cybersecurity) {
    items.push({
      name: "Cybersecurity",
      category: "Security",
      description: "EDR/XDR, firewall management, threat detection",
      unit: "device",
      quantity: devices,
      unit_price: 125,
      sla_tier: "Enhanced protection",
      kpi_tags: ["MTTA", "MTTR"],
    });
  }
  if (backup) {
    items.push({
      name: "Backup & Disaster Recovery",
      category: "Resilience",
      description: "Encrypted backups, off-site replication, DR",
      unit: "device",
      quantity: devices,
      unit_price: 75,
      sla_tier: "Recovery-ready",
      kpi_tags: ["Backup success", "RTO"],
    });
  }
  return items;
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, company, devices, cybersecurity, backup } = req.body ?? {};
    if (!email || !devices) {
      return res.status(400).json({ error: "Email and number of devices are required." });
    }

    const estimate = calculateEstimate({ devices, cybersecurity, backup });
    const publicId = `EST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const appBaseUrl = getBaseUrl(req);
    const slaUrl = appBaseUrl ? `${appBaseUrl}/sla/${publicId}` : null;

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .insert({
        public_id: publicId,
        name: `Estimate for ${company ?? email}`,
        customer: company ?? email,
        contact_name: name ?? null,
        contact_email: email,
        status: "Estimate",
        currency: "ZAR",
        assumptions: [],
        terms: [],
        subtotal: estimate.subtotal,
        total: estimate.total,
        sla_url: slaUrl,
      })
      .select("*")
      .single();
    if (quoteError) throw quoteError;

    const items = buildItems({ devices, cybersecurity, backup });
    const { error: itemsError } = await supabase.from("quote_items").insert(
      items.map((item) => ({
        quote_id: quote.id,
        name: item.name,
        category: item.category,
        description: item.description,
        unit: item.unit,
        quantity: item.quantity,
        unit_price: item.unit_price,
        sla_tier: item.sla_tier,
        kpi_tags: item.kpi_tags,
      }))
    );
    if (itemsError) throw itemsError;

    const { error: leadError } = await supabase.from("leads").insert({
      name: name ?? null,
      email,
      company: company ?? null,
      devices,
      cybersecurity: Boolean(cybersecurity),
      backup: Boolean(backup),
      estimate_low: estimate.low,
      estimate_high: estimate.high,
      quote_public_id: quote.public_id,
    });
    if (leadError) throw leadError;

    if (!mailjetKey || !mailjetSecret || !mailjetFromEmail) {
      return res.status(200).json({ ok: true, quoteId: quote.public_id, warning: "Mailjet not configured." });
    }

    const acceptUrl = appBaseUrl ? `${appBaseUrl}/quote/${quote.public_id}/accept` : "";
    const logoDark = await loadLogo(appBaseUrl, "/logo-dark.png");
    const logoLight = await loadLogo(appBaseUrl, "/logo-light.png");
    const pdf = await buildPdf({ quote, items, acceptUrl, slaUrl, logoDark, logoLight });

    const client = mailjet.apiConnect(mailjetKey, mailjetSecret);
    await client.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: { Email: mailjetFromEmail, Name: mailjetFromName },
          To: [{ Email: email, Name: name ?? email }],
          Subject: "Your Continuate Managed Services Estimate",
          TextPart: `Hi ${name ?? ""}\n\nAttached is your estimated proposal. We are ready to fine-tune this with you.`,
          HTMLPart:
            "<p>Hi " +
            (name ?? "") +
            ",</p><p>Attached is your estimated proposal. We are ready to fine-tune this with you.</p>",
          Attachments: [
            {
              ContentType: "application/pdf",
              Filename: `Continuate-Estimate-${quote.public_id}.pdf`,
              Base64Content: Buffer.from(pdf).toString("base64"),
            },
          ],
        },
      ],
    });

    return res.status(200).json({ ok: true, quoteId: quote.public_id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send estimate.";
    return res.status(500).json({ error: message });
  }
}
