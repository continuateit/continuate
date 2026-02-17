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
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 80, left: 40, right: 40, bottom: 50 },
    });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    const currency = quote.currency ?? "ZAR";
    const assumptions = normalizeList(quote.assumptions);
    const terms = normalizeList(quote.terms);
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const bodyTextColor = "#333";
    const bodyFontSize = 9;

    const sectionTitle = (text) => {
      doc.moveDown(0.9);
      const y = doc.y;
      doc.rect(doc.page.margins.left, y + 2, 4, 12).fill("#111");
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor("#111")
        .text(text.toUpperCase(), doc.page.margins.left + 10, y);
      doc.moveDown(0.35);
    };

    let drawingHeader = false;
    const drawHeaderFooter = (pageIndex) => {
      if (pageIndex === 0) return;
      if (drawingHeader) return;
      drawingHeader = true;
      const topY = 28;
      if (logoLight) {
        try {
          doc.image(logoLight, doc.page.margins.left, topY, { width: 90 });
        } catch {
          // ignore logo render errors
        }
      }
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
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#666")
        .text(`Page ${pageIndex + 1}`, doc.page.width - doc.page.margins.right - 60, footerY - 6, {
          width: 60,
          align: "right",
          lineBreak: false,
        });
      drawingHeader = false;
    };

    let pageIndex = 0;
    doc.on("pageAdded", () => {
      pageIndex += 1;
      drawHeaderFooter(pageIndex);
    });

    // Cover (premium, minimal)
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#111");
    if (logoDark) {
      try {
        doc.image(logoDark, 40, 40, { width: 180 });
      } catch {
        // ignore
      }
    }
    doc.fillColor("#fff");
    doc.font("Helvetica").fontSize(12).text("Managed Security Services Proposal", 40, 140);
    doc.font("Helvetica-Bold").fontSize(28).text(quote.customer ?? "Client", 40, 165);
    doc.moveTo(40, 210).lineTo(260, 210).lineWidth(2).strokeColor("#fff").stroke();
    doc.font("Helvetica").fontSize(11).text("Prepared by: Continuate IT Services (Pty) Ltd.", 40, 235);
    doc.text(`Proposal Reference: ${quote.public_id}`, 40, 255);
    doc.text(`Date: ${new Date().toLocaleDateString("en-ZA")}`, 40, 275);
    doc.text("Confidential & Proprietary", 40, 310);

    doc.addPage();
    doc.fontSize(bodyFontSize).fillColor("#111");

    sectionTitle("Executive Overview");
    doc.font("Helvetica").fontSize(bodyFontSize).fillColor(bodyTextColor);
    doc.text(
      "In today’s evolving threat landscape, financial institutions are primary targets for increasingly sophisticated cyber attacks.",
      { width: pageWidth }
    );
    doc.moveDown(0.5);
    doc.text(
      "Continuate IT Services proposes a fully managed, 24/7 security operations framework designed to reduce cyber risk exposure, ensure regulatory alignment, protect business continuity, and deliver measurable security maturity improvement.",
      { width: pageWidth }
    );
    doc.moveDown(0.4);
    doc.text(
      `Our Managed Security Services provide enterprise-grade protection tailored specifically to the operational requirements of ${
        quote.customer ?? "your organization"
      }.`,
      { width: pageWidth }
    );

    sectionTitle("Why Continuate IT Services");
    [
      "24/7 Security Operations Monitoring",
      "Financial Sector Threat Awareness",
      "Proactive Threat Hunting",
      "Compliance-Driven Security Framework",
      "Dedicated Account Management",
      "Transparent, Predictable Pricing",
    ].forEach((line) => doc.text(`• ${line}`, { width: pageWidth }));

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
    doc.font("Helvetica-Bold").text("Core Security Operations", { width: pageWidth });
    doc.font("Helvetica").fontSize(9);
    [
      "Security Monitoring (24/7 SOC): Continuous real-time monitoring of your environment.",
      "Managed EDR / XDR: Advanced endpoint threat detection and automated containment.",
      "SIEM & Log Management: Centralized event correlation and anomaly detection.",
      "Firewall & Network Security Management: Policy control, rule audits, and traffic monitoring.",
      "Incident Response Management: Coordinated containment, remediation, and reporting.",
      "Vulnerability & Patch Oversight: Risk-based remediation planning.",
    ].forEach((item) => doc.text(`• ${item}`, { width: pageWidth }));

    doc.moveDown(0.4);
    doc.font("Helvetica-Bold").text("Optional Enhancements", { width: pageWidth });
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
    doc.font("Helvetica").fontSize(bodyFontSize).fillColor(bodyTextColor);
    doc.text(
      "Our Service Level commitments are aligned to business risk impact and operational continuity requirements.",
      { width: pageWidth }
    );
    doc.moveDown(0.4);
    const svcTableTop = doc.y;
    const svcColX = [40, 170, 340];
    const svcColW = [130, 170, 215];
    const svcRowH = 18;
    const svcRows = [
      ["Critical", "< 1 Hour", "4–8 Hours"],
      ["High", "< 4 Hours", "24 Hours"],
      ["Medium", "< 8 Hours", "2–3 Business Days"],
      ["Low", "1 Business Day", "Scheduled"],
    ];
    doc.rect(40, svcTableTop, 515, svcRowH).fill("#f3f4f6");
    doc.font("Helvetica-Bold").fontSize(bodyFontSize).fillColor("#333");
    doc.text("Priority", svcColX[0], svcTableTop + 5, { width: svcColW[0] });
    doc.text("Response Time", svcColX[1], svcTableTop + 5, { width: svcColW[1] });
    doc.text("Resolution Target", svcColX[2], svcTableTop + 5, { width: svcColW[2] });
    svcRows.forEach((row, index) => {
      const rowY = svcTableTop + svcRowH * (index + 1);
      if (index % 2 === 1) {
        doc.rect(40, rowY, 515, svcRowH).fill("#fafafa");
      }
      doc.font("Helvetica").fontSize(bodyFontSize).fillColor("#111");
      doc.text(row[0], svcColX[0], rowY + 5, { width: svcColW[0] });
      doc.text(row[1], svcColX[1], rowY + 5, { width: svcColW[1] });
      doc.text(row[2], svcColX[2], rowY + 5, { width: svcColW[2] });
    });
    doc.y = svcTableTop + svcRowH * (svcRows.length + 1) + 8;

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
    doc.font("Helvetica-Bold").text("Investment Summary", { width: pageWidth });
    doc.font("Helvetica").fontSize(bodyFontSize).fillColor(bodyTextColor);
    doc.text("Monthly Managed Security Investment", { width: pageWidth });
    doc.moveDown(0.2);
    const tableTop = doc.y;
    const colX = [40, 260, 330, 410];
    const colW = [220, 70, 80, 145];
    const rowH = 18;
    doc.rect(40, tableTop, 515, rowH).fill("#f3f4f6");
    doc.font("Helvetica-Bold").fontSize(bodyFontSize).fillColor("#333");
    doc.text("Service Component", colX[0], tableTop + 5, { width: colW[0] });
    doc.text("Users", colX[1], tableTop + 5, { width: colW[1], align: "right" });
    doc.text("Unit", colX[2], tableTop + 5, { width: colW[2], align: "right" });
    doc.text("Monthly Total", colX[3], tableTop + 5, { width: colW[3], align: "right" });

    doc.fillColor("#111").font("Helvetica").fontSize(bodyFontSize);
    if (!items?.length) {
      const rowY = tableTop + rowH;
      doc.rect(40, rowY, 515, rowH).fill("#fafafa");
      doc.fillColor("#111").text("No line items added.", 44, rowY + 5, { width: 507 });
      doc.y = rowY + rowH + 8;
    } else {
      items.forEach((item, index) => {
        const rowY = tableTop + rowH * (index + 1);
        if (index % 2 === 1) {
          doc.rect(40, rowY, 515, rowH).fill("#fafafa");
        }
        const total = Number(item.unit_price ?? 0) * Number(item.quantity ?? 0);
        doc.fillColor("#111").text(item.name ?? "Service", colX[0] + 4, rowY + 5, { width: colW[0] - 8, ellipsis: true });
        doc.text(String(item.quantity ?? 0), colX[1], rowY + 5, { width: colW[1], align: "right" });
        doc.text(formatCurrency(item.unit_price ?? 0, currency), colX[2], rowY + 5, {
          width: colW[2],
          align: "right",
        });
        doc.text(formatCurrency(total, currency), colX[3], rowY + 5, { width: colW[3], align: "right" });
      });
      doc.y = tableTop + rowH * (items.length + 1) + 8;
    }

    doc.moveDown(0.3);
    doc.strokeColor("#eee").moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").fontSize(14).fillColor("#111");
    doc.text("Total Monthly Investment", 40, doc.y, { continued: true });
    doc.text(` ${formatCurrency(quote.total ?? 0, currency)} (Excl. VAT)`);
    doc.moveDown(0.4);
    doc.font("Helvetica").fontSize(bodyFontSize).fillColor("#555");
    doc.text("One-Time Setup Fee: Included", { width: pageWidth });
    doc.text("Implementation Timeline: 2–6 Weeks", { width: pageWidth });
    doc.moveDown(0.4);
    doc.text(
      "This investment provides enterprise-grade 24/7 protection, proactive risk management, and compliance-aligned security operations.",
      { width: pageWidth }
    );

    doc.moveDown(0.6);
    doc.x = doc.page.margins.left;

    sectionTitle("Contract Terms");
    doc.font("Helvetica").fontSize(bodyFontSize);
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

    sectionTitle("Governance & Compliance Alignment");
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

    sectionTitle("Agreement & Acceptance");
    doc.font("Helvetica").fontSize(bodyFontSize);
    const accTop = doc.y;
    const accColX = [40, 300];
    doc.text("For Client", accColX[0], accTop);
    doc.text("For Continuate IT Services", accColX[1], accTop);
    doc.moveDown(0.6);
    doc.text("Name: ____________________________", accColX[0], doc.y);
    doc.text("Name: ____________________________", accColX[1], doc.y);
    doc.moveDown(0.6);
    doc.text("Title: ____________________________", accColX[0], doc.y);
    doc.text("Title: ____________________________", accColX[1], doc.y);
    doc.moveDown(0.6);
    doc.text("Signature: ________________________", accColX[0], doc.y);
    doc.text("Signature: ________________________", accColX[1], doc.y);
    doc.moveDown(0.6);
    doc.text("Date: ____________", accColX[0], doc.y);
    doc.text("Date: ____________", accColX[1], doc.y);

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
