import PDFDocument from "pdfkit";

export const formatCurrency = (value, currency) => {
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

export const normalizeList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return value.split("\n").map((line) => line.trim()).filter(Boolean);
  return [];
};

export const buildPdf = ({ quote, items, acceptUrl, slaUrl, logoDark, logoLight }) =>
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
      const y = doc.y;
      doc.rect(doc.page.margins.left, y + 2, 6, 12).fill("#111");
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor("#111")
        .text(text.toUpperCase(), doc.page.margins.left + 12, y);
      doc.moveDown(0.3);
    };

    const drawHeaderFooter = (pageIndex) => {
      if (pageIndex === 0) return;
      const topY = 28;
      if (logoLight) {
        try {
          doc.image(logoLight, doc.page.margins.left, topY, { width: 90 });
        } catch {
          // ignore logo render errors
        }
      }
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#666")
        .text("Continuate IT Services", doc.page.margins.left + 100, topY + 6);
      doc
        .strokeColor("#e5e5e5")
        .lineWidth(1)
        .moveTo(doc.page.margins.left, 60)
        .lineTo(doc.page.width - doc.page.margins.right, 60)
        .stroke();

      const footerY = doc.page.height - 40;
      doc
        .strokeColor("#e5e5e5")
        .lineWidth(1)
        .moveTo(doc.page.margins.left, footerY - 10)
        .lineTo(doc.page.width - doc.page.margins.right, footerY - 10)
        .stroke();
      if (logoLight) {
        try {
          doc.image(logoLight, doc.page.margins.left, footerY - 6, { width: 60 });
        } catch {
          // ignore
        }
      }
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#666")
        .text(`Page ${pageIndex + 1}`, doc.page.width - doc.page.margins.right - 60, footerY - 6, {
          width: 60,
          align: "right",
        });
      doc.y = 80;
    };

    let pageIndex = 0;
    doc.on("pageAdded", () => {
      pageIndex += 1;
      drawHeaderFooter(pageIndex);
    });

    // Cover
    doc.rect(0, 0, doc.page.width, 220).fill("#111");
    doc.fillColor("#fff");
    doc.font("Helvetica-Bold").fontSize(28).text("Business Proposal", 40, 70);
    doc.font("Helvetica").fontSize(20).text("Managed Security Services", 40, 105);
    doc.moveTo(40, 150).lineTo(260, 150).lineWidth(2).strokeColor("#fff").stroke();
    doc.font("Helvetica").fontSize(11).fillColor("#fff");
    doc.text(`Prepared for: ${quote.customer ?? "—"}`, 40, 170);
    doc.text(`Proposal Ref: ${quote.public_id}`, 40, 188);

    if (logoDark) {
      try {
        doc.image(logoDark, 40, 235, { width: 120 });
      } catch {
        // ignore
      }
    }
    doc.fillColor("#111");
    doc.font("Helvetica-Bold").fontSize(14).text("CONTINUATE IT SERVICES", 40, 260);
    doc.font("Helvetica").fontSize(10).text("377 Rivonia Boulevard, Sandton, 2196");
    doc.text("info@continuate.co.za • 073 209 9100");
    doc.text(`Date: ${new Date().toLocaleDateString("en-ZA")}`);

    doc.addPage();
    doc.fontSize(10).fillColor("#111");

    doc.font("Helvetica-Bold").fontSize(16).text("Managed Security Services Proposal");
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(9).fillColor("#444");
    doc.text(`Client Name: ${quote.customer ?? "—"}`);
    doc.text(`Prepared By: Continuate IT Services`);
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

    doc.moveDown(0.6);
    doc.x = doc.page.margins.left;

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
