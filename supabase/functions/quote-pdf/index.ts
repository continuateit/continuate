import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const appBaseUrl = Deno.env.get("APP_BASE_URL") ?? "http://localhost:8080";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const createPdf = async (quote: any, items: any[]) => {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let y = 790;

  const drawText = (text: string, size = 12, isBold = false) => {
    page.drawText(text, {
      x: 50,
      y,
      size,
      font: isBold ? bold : font,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= size + 8;
  };

  drawText("Continuate Proposal", 20, true);
  drawText(`Quote ID: ${quote.public_id}`);
  drawText(`Prepared for: ${quote.customer}`);
  drawText(`Contact: ${quote.contact_name ?? "—"} (${quote.contact_email ?? "—"})`);
  drawText(`Owner: ${quote.owner ?? "—"}`);
  drawText(`Expires: ${quote.expires_at ?? "—"}`);
  y -= 6;

  drawText("Scope of Services", 14, true);
  items.forEach((item) => {
    const line = `${item.name} — ${item.category} — ${item.quantity} ${item.unit ?? ""} @ ${item.unit_price}`;
    drawText(line, 10);
  });

  y -= 6;
  drawText(`Subtotal: ${quote.subtotal ?? 0}`, 12, true);
  drawText(`Total: ${quote.total ?? 0}`, 12, true);
  y -= 6;
  drawText("Assumptions", 12, true);
  (quote.assumptions ?? []).forEach((a: string) => drawText(`• ${a}`, 10));
  y -= 4;
  drawText("Terms", 12, true);
  (quote.terms ?? []).forEach((t: string) => drawText(`• ${t}`, 10));
  y -= 6;
  drawText(`Review and accept online: ${appBaseUrl.replace(/\/$/, "")}/quote/${quote.public_id}`, 10);

  const bytes = await pdf.save();
  return btoa(String.fromCharCode(...bytes));
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    console.log("[quote-pdf] OPTIONS preflight");
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    console.log("[quote-pdf] request start");
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("[quote-pdf] missing Authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: authUser, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authUser?.user) {
      console.log("[quote-pdf] auth error", authError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    console.log("[quote-pdf] auth ok", authUser.user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("auth_user_id", authUser.user.id)
      .maybeSingle();
    if (profile?.role !== "admin") {
      console.log("[quote-pdf] forbidden role", profile?.role ?? "none");
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }
    console.log("[quote-pdf] role ok");

    const { quoteId } = await req.json();
    if (!quoteId) {
      console.log("[quote-pdf] missing quoteId");
      return new Response(JSON.stringify({ error: "quoteId is required" }), { status: 400 });
    }
    console.log("[quote-pdf] quoteId", quoteId);

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("*")
      .eq("public_id", quoteId)
      .single();
    if (quoteError || !quote) {
      console.log("[quote-pdf] quote fetch error", quoteError?.message);
      throw quoteError ?? new Error("Quote not found");
    }

    const { data: items, error: itemsError } = await supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", quote.id);
    if (itemsError) {
      console.log("[quote-pdf] items error", itemsError?.message);
      throw itemsError;
    }

    const pdfBase64 = await createPdf(quote, items ?? []);
    console.log("[quote-pdf] pdf generated", pdfBase64.length);
    return new Response(JSON.stringify({ base64: pdfBase64, filename: `Continuate-Quote-${quote.public_id}.pdf` }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (error) {
    console.log("[quote-pdf] error", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
