import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const mailjetKey = Deno.env.get("MAILJET_API_KEY");
const mailjetSecret = Deno.env.get("MAILJET_API_SECRET");
const mailjetFromEmail = Deno.env.get("MAILJET_FROM_EMAIL");
const mailjetFromName = Deno.env.get("MAILJET_FROM_NAME") ?? "Continuate";
const appBaseUrl = Deno.env.get("APP_BASE_URL") ?? "http://localhost:8080";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}
if (!mailjetKey || !mailjetSecret || !mailjetFromEmail) {
  throw new Error("Missing MAILJET_API_KEY, MAILJET_API_SECRET, or MAILJET_FROM_EMAIL");
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

const sendMailjet = async (payload: {
  toEmail: string;
  toName?: string;
  subject: string;
  html: string;
  text: string;
  pdfBase64: string;
  filename: string;
}) => {
  const auth = btoa(`${mailjetKey}:${mailjetSecret}`);
  const response = await fetch("https://api.mailjet.com/v3.1/send", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Messages: [
        {
          From: { Email: mailjetFromEmail, Name: mailjetFromName },
          To: [{ Email: payload.toEmail, Name: payload.toName ?? payload.toEmail }],
          Subject: payload.subject,
          TextPart: payload.text,
          HTMLPart: payload.html,
          Attachments: [
            {
              ContentType: "application/pdf",
              Filename: payload.filename,
              Base64Content: payload.pdfBase64,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mailjet failed: ${errorText}`);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { quoteId, dryRun } = await req.json();
    if (!quoteId) {
      return new Response(JSON.stringify({ error: "quoteId is required" }), { status: 400 });
    }

    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select("*")
      .eq("public_id", quoteId)
      .single();
    if (quoteError || !quote) throw quoteError ?? new Error("Quote not found");

    const { data: items, error: itemsError } = await supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", quote.id);
    if (itemsError) throw itemsError;

    const pdfBase64 = await createPdf(quote, items ?? []);
    const link = `${appBaseUrl.replace(/\/$/, "")}/quote/${quote.public_id}`;
    const subject = `Your Continuate Proposal — ${quote.name}`;

    if (!dryRun) {
      await sendMailjet({
        toEmail: quote.contact_email,
        toName: quote.contact_name,
        subject,
        text: `Hi ${quote.contact_name ?? quote.customer},\n\nYour proposal is ready: ${link}\n\nBest,\nContinuate`,
        html: `<p>Hi ${quote.contact_name ?? quote.customer},</p><p>Your Continuate proposal is ready.</p><p><a href="${link}">Open the live proposal</a></p><p>The PDF is attached.</p><p>Best,<br/>Continuate</p>`,
        pdfBase64,
        filename: `Continuate-Quote-${quote.public_id}.pdf`,
      });
    }

    if (!dryRun) {
      await supabase
        .from("quotes")
        .update({ status: "Sent", sent_at: new Date().toISOString() })
        .eq("id", quote.id);
    }

    return new Response(JSON.stringify({ ok: true, dryRun: Boolean(dryRun) }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
