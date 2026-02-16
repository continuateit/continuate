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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing Authorization header" });
    const token = authHeader.replace("Bearer ", "");
    const { data: authUser, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authUser?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("auth_user_id", authUser.user.id)
      .maybeSingle();
    if (profileError) throw profileError;
    if (profile?.role !== "admin") return res.status(403).json({ error: "Forbidden" });

    const { quoteId, dryRun } = req.body ?? {};
    if (!quoteId) return res.status(400).json({ error: "quoteId is required" });

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("*")
      .eq("public_id", quoteId)
      .single();
    if (quoteError || !quote) return res.status(404).json({ error: "Quote not found" });

    const { data: items, error: itemsError } = await supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", quote.id);
    if (itemsError) throw itemsError;

    const appBaseUrl = getBaseUrl(req);
    const acceptUrl = appBaseUrl ? `${appBaseUrl}/quote/${quote.public_id}/accept` : "";
    const slaUrl = quote.sla_url ?? (appBaseUrl ? `${appBaseUrl}/sla/${quote.public_id}` : "");
    const logoDark = await loadLogo(appBaseUrl, "/logo-dark.png");
    const logoLight = await loadLogo(appBaseUrl, "/logo-light.png");
    const pdf = await buildPdf({ quote, items, acceptUrl, slaUrl, logoDark, logoLight });

    if (!mailjetKey || !mailjetSecret || !mailjetFromEmail) {
      return res.status(200).json({ ok: true, warning: "Mailjet not configured." });
    }

    if (!dryRun) {
      const client = mailjet.apiConnect(mailjetKey, mailjetSecret);
      await client.post("send", { version: "v3.1" }).request({
        Messages: [
          {
            From: { Email: mailjetFromEmail, Name: mailjetFromName },
            To: [{ Email: quote.contact_email, Name: quote.contact_name ?? quote.customer }],
            Subject: `Your Continuate Proposal — ${quote.name}`,
            TextPart: `Hi ${quote.contact_name ?? quote.customer},\n\nYour proposal is ready: ${acceptUrl}\n\nBest,\nContinuate`,
            HTMLPart: `<p>Hi ${quote.contact_name ?? quote.customer},</p><p>Your proposal is ready.</p><p><a href="${acceptUrl}">Open the live proposal</a></p><p>The PDF is attached.</p><p>Best,<br/>Continuate</p>`,
            Attachments: [
              {
                ContentType: "application/pdf",
                Filename: `Continuate-Quote-${quote.public_id}.pdf`,
                Base64Content: Buffer.from(pdf).toString("base64"),
              },
            ],
          },
        ],
      });

      await supabase
        .from("quotes")
        .update({ status: "Sent", sent_at: new Date().toISOString() })
        .eq("id", quote.id);
    }

    return res.status(200).json({ ok: true, dryRun: Boolean(dryRun) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send quote.";
    return res.status(500).json({ error: message });
  }
}
