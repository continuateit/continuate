import { createClient } from "@supabase/supabase-js";
import { buildPdf } from "./_pdf.js";

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
    const logoDark = await loadLogo(appBaseUrl, "/logo-dark.png");
    const logoLight = await loadLogo(appBaseUrl, "/logo-light.png");
    const pdf = await buildPdf({ quote, items, acceptUrl, slaUrl, logoDark, logoLight });

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
