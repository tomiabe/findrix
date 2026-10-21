/* ============================================================
   findrix AI visibility audit report: PDF export
   Builds a branded, printable report from the audit data in
   app.js using the vendored jsPDF build (vendor/jspdf.umd.min.js).
   ============================================================ */

(function () {
  if (!window.jspdf || !window.jspdf.jsPDF) return;

  const { jsPDF } = window.jspdf;

  const INK = "#0A0A0A";
  const MUTED = "#6B6B6B";
  const LINE = "#E7E7E4";
  const SURFACE = "#F4F4F2";
  const POP = "#00FF88";
  const GREEN = "#00B25E";
  const GREEN_TINT = "#E6F8EF";
  const GREEN_INK = "#007A48";
  const WARN = "#FFB020";
  const WARN_TINT = "#FFF3D6";
  const WARN_INK = "#9A6B00";
  const FAIL = "#FF5C38";
  const FAIL_TINT = "#FFE9E3";
  const FAIL_INK = "#C73A1C";

  const STATUS = {
    pass: { label: "Pass", tint: GREEN_TINT, ink: GREEN_INK },
    warn: { label: "Partial", tint: WARN_TINT, ink: WARN_INK },
    fail: { label: "Missing", tint: FAIL_TINT, ink: FAIL_INK }
  };

  const P_TAG = {
    P1: { fill: INK, text: "#FFFFFF" },
    P2: { fill: SURFACE, text: INK },
    P3: { fill: SURFACE, text: INK },
    "Long term": { fill: SURFACE, text: INK }
  };

  const ML = 48;
  const PW = 595.28;
  const PH = 841.89;
  const CW = PW - ML * 2;
  const FOOT_Y = PH - 30;

  let doc;
  let y = 0;
  let logoData = null;
  let logoW = 0;
  let logoH = 0;

  function hex(c) {
    return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  }
  function setInk(c) { const [r, g, b] = hex(c); doc.setTextColor(r, g, b); }
  function setFill(c) { const [r, g, b] = hex(c); doc.setFillColor(r, g, b); }

  function ensure(h) {
    if (y + h > PH - 52) newPage();
  }

  function newPage() {
    doc.addPage();
    y = 84;
    drawHeader();
  }

  function drawHeader() {
    if (logoData) {
      doc.addImage(logoData, "PNG", ML, 26, logoW, logoH);
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      setInk(INK);
      doc.text("findrix", ML, 38);
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setInk(MUTED);
    doc.text("AI visibility audit", ML + (logoData ? logoW + 10 : 54), 33);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    setInk(INK);
    doc.text(META.site, PW - ML, 33, { align: "right" });
    setFill(POP);
    doc.roundedRect(ML, 52, CW, 3, 1.5, 1.5, "F");
    y = 68;
  }

  function drawFooters() {
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      setInk(LINE);
      doc.setDrawColor.apply(null, hex(LINE));
      doc.setLineWidth(1);
      doc.line(ML, FOOT_Y - 8, PW - ML, FOOT_Y - 8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      setInk(MUTED);
      doc.text("susinsight.com", ML, FOOT_Y + 2);
      doc.text("findrix.ai", ML, FOOT_Y + 13);
      doc.text("Page " + i + " of " + pages, PW - ML, FOOT_Y + 2, { align: "right" });
    }
  }

  function sectionHead(num, title, sub) {
    ensure(52);
    if (sub) {
      const lines = doc.splitTextToSize(sub, CW);
      ensure(52 + lines.length * 12);
    }
    setFill(POP);
    doc.roundedRect(ML, y, 4, 14, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    setInk(INK);
    doc.text(num + "   " + title, ML + 12, y + 11);
    y += 20;
    setInk(LINE);
    doc.setDrawColor.apply(null, hex(LINE));
    doc.setLineWidth(1);
    doc.line(ML, y, PW - ML, y);
    y += 12;
    if (sub) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      setInk(MUTED);
      const lines = doc.splitTextToSize(sub, CW);
      doc.text(lines, ML, y);
      y += lines.length * 12 + 6;
    }
  }

  function statusChip(status, cx) {
    const s = STATUS[status];
    setFill(s.tint);
    const w = doc.getTextWidth(s.label) + 18;
    doc.roundedRect(cx, y - 8.5, w, 14, 7, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    setInk(s.ink);
    doc.text(s.label, cx + 9, y, { align: "center" });
    return w;
  }

  function priorityTag(p, px) {
    const t = P_TAG[p] || P_TAG.P3;
    setFill(t.fill);
    const w = doc.getTextWidth(p) + 14;
    doc.roundedRect(px, y - 8.5, w, 14, 7, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    setInk(t.text);
    doc.text(p, px + 7, y, { align: "center" });
    return w;
  }

  function renderHero() {
    y = 84;
    drawHeader();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setInk(MUTED);
    doc.text("AI VISIBILITY AUDIT", ML, y);
    y += 18;
    doc.setFontSize(22);
    setInk(INK);
    doc.text(META.site + " is " + META.verdict.toLowerCase() + ".", ML, y);
    y += 20;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    setInk(MUTED);
    const narrative = doc.splitTextToSize(META.narrative, CW);
    doc.text(narrative, ML, y);
    y += narrative.length * 13.5 + 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    setInk(MUTED);
    doc.text(
      CHECKS.length + " checks  ·  " + META.generated + "  ·  Ran in " + META.duration + "  ·  " + CATEGORIES.length + " categories",
      ML, y
    );
    y += 16;

    const barW = CW;
    const pct = META.score / 100;
    setFill(SURFACE);
    doc.roundedRect(ML, y, barW, 9, 4.5, 4.5, "F");
    setFill(GREEN);
    doc.roundedRect(ML, y, barW * pct, 9, 4.5, 4.5, "F");
    y += 9;
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    setInk(INK);
    doc.text(META.score + " / 100", ML, y);
    doc.setFontSize(10);
    setInk(GREEN_INK);
    doc.text(META.verdict, PW - ML, y, { align: "right" });
    y += 22;
  }

  function renderCats() {
    sectionHead("01", "Score by category", "Where AI is reading the site, one category at a time. Access and Schema carry the most weight.");
    CATEGORIES.forEach((c) => {
      ensure(30);
      const scored = c.score !== null;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      setInk(INK);
      doc.text(c.name, ML, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      setInk(MUTED);
      doc.text(c.checks + " checks", ML + doc.getTextWidth(c.name) + 8, y);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      setInk(scored ? GREEN_INK : MUTED);
      doc.text(scored ? c.score + "%" : "not scored", PW - ML, y, { align: "right" });
      y += 8;
      setFill(SURFACE);
      doc.roundedRect(ML, y, CW, 5, 2.5, 2.5, "F");
      if (scored) {
        setFill(GREEN);
        doc.roundedRect(ML, y, CW * (c.score / 100), 5, 2.5, 2.5, "F");
      }
      y += 14;
    });
    y += 8;
  }

  function renderGaps() {
    sectionHead("02", "Where the score is stuck", "Seven gaps move the score fastest. Each has exactly one action.");
    GAPS.forEach((g) => {
      const impactLines = doc.splitTextToSize(g.impact, CW - 6);
      const actionLines = doc.splitTextToSize(g.action, CW - 6);
      ensure(44 + (impactLines.length + actionLines.length) * 12);
      setFill(SURFACE);
      doc.circle(ML + 7, y - 4, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      setInk(MUTED);
      doc.text(String(g.rank), ML + 7, y, { align: "center" });
      let cx = ML + 22;
      cx += statusChip(g.status, cx) + 6;
      priorityTag(g.priority, cx);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      setInk(INK);
      doc.text(g.title, ML + 22, y + 12);
      y += 20;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      setInk(MUTED);
      doc.text(impactLines, ML + 22, y);
      y += impactLines.length * 12 + 4;
      doc.setFontSize(9.5);
      setInk(INK);
      doc.text("Do this:", ML + 22, y);
      const doW = doc.getTextWidth("Do this:");
      setInk(MUTED);
      doc.text(actionLines[0], ML + 22 + doW + 5, y);
      y += 4;
      if (actionLines.length > 1) {
        setInk(MUTED);
        doc.text(actionLines.slice(1), ML + 22 + doW + 5, y);
        y += (actionLines.length - 1) * 12 + 4;
      }
      y += 14;
    });
    y += 8;
  }

  function renderPlan() {
    sectionHead("03", "Week 1 plan", "Three roles, nine actions. Assumes the site opts in to being cited by AI assistants; the Access P1s clear automatically then.");
    PLAN.forEach((role) => {
      ensure(30);
      setFill(SURFACE);
      doc.roundedRect(ML, y - 10, CW, 20, 4, 4, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      setInk(INK);
      doc.text(role.role, ML + 10, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      setInk(MUTED);
      doc.text(role.items.length + " items", PW - ML - 10, y, { align: "right" });
      y += 18;
      role.items.forEach((it) => {
        const lines = doc.splitTextToSize(it.text, CW - 40);
        ensure(20 + lines.length * 12);
        priorityTag(it.p, ML);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        setInk(INK);
        doc.text(lines, ML + 34, y - 1);
        y += lines.length * 12 + 8;
      });
      y += 8;
    });
    y += 8;
  }

  function renderLongterm() {
    sectionHead("04", "Brand signals, played long", "These take months, not sprints. They are not failures and they do not block the week 1 plan.");
    LONGTERM.forEach((l) => {
      const impactLines = doc.splitTextToSize(l.impact, CW);
      const actionLines = doc.splitTextToSize(l.action, CW);
      ensure(36 + (impactLines.length + actionLines.length) * 12);
      statusChip(l.status, ML);
      let cx = ML + doc.getTextWidth(STATUS[l.status].label) + 24;
      priorityTag(l.priority, cx);
      cx += doc.getTextWidth(l.priority) + 20;
      priorityTag("Long term", cx);
      y += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      setInk(INK);
      doc.text(l.title, ML, y + 8);
      y += 16;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      setInk(MUTED);
      doc.text(impactLines, ML, y);
      y += impactLines.length * 12 + 4;
      setInk(INK);
      doc.text("Do this:", ML, y);
      const doW = doc.getTextWidth("Do this:");
      setInk(MUTED);
      doc.text(actionLines[0], ML + doW + 5, y);
      y += 4;
      if (actionLines.length > 1) {
        setInk(MUTED);
        doc.text(actionLines.slice(1), ML + doW + 5, y);
        y += (actionLines.length - 1) * 12 + 4;
      }
      y += 16;
    });
    y += 8;
  }

  function renderChecklist() {
    sectionHead("05", "Full " + CHECKS.length + " point checklist", "Reference. Every check, grouped by category, with the impact and the action.");
    const order = ["Access", "Schema", "Content", "AI interaction", "Performance"];
    order.forEach((cat) => {
      const items = CHECKS.filter((c) => c.category === cat);
      const catMeta = CATEGORIES.find((c) => c.name === cat);
      ensure(30);
      setFill(SURFACE);
      doc.roundedRect(ML, y - 10, CW, 20, 4, 4, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      setInk(INK);
      doc.text(cat, ML + 10, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      setInk(MUTED);
      doc.text(catMeta.score !== null ? catMeta.score + "%" : "Not scored", PW - ML - 10, y, { align: "right" });
      y += 18;

      items.forEach((c) => {
        const impactLines = doc.splitTextToSize(c.impact, CW - 34);
        const actionLines = doc.splitTextToSize(c.action, CW - 34);
        ensure(24 + (impactLines.length + actionLines.length) * 11);
        const s = STATUS[c.status];
        setFill(s.tint);
        doc.circle(ML + 6, y - 4, 7, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        setInk(s.ink);
        doc.text(s.label[0], ML + 6, y, { align: "center" });
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        setInk(INK);
        doc.text(c.title, ML + 18, y);
        y += 11;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        setInk(MUTED);
        doc.text(impactLines, ML + 18, y);
        y += impactLines.length * 10.5 + 3;
        setInk(INK);
        doc.text("Do this:", ML + 18, y);
        const doW = doc.getTextWidth("Do this:");
        setInk(MUTED);
        doc.text(actionLines[0], ML + 18 + doW + 5, y);
        y += 4;
        if (actionLines.length > 1) {
          setInk(MUTED);
          doc.text(actionLines.slice(1), ML + 18 + doW + 5, y);
          y += (actionLines.length - 1) * 10.5 + 3;
        }
        y += 10;
      });
      y += 8;
    });

    ensure(30);
    setFill(SURFACE);
    doc.roundedRect(ML, y - 8, CW, 20, 4, 4, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    setInk(MUTED);
    doc.text(
      "Probe method: live fetch using each bot User-Agent from a shared IP. Catches User-Agent filtering, not IP allowlists.",
      ML + 10, y
    );
    y += 16;
  }

  async function loadLogo() {
    return new Promise((resolve) => {
      const img = new Image();
      const done = () => resolve();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          canvas.getContext("2d").drawImage(img, 0, 0);
          logoData = canvas.toDataURL("image/png");
          logoH = 20;
          logoW = logoH * (img.naturalWidth / img.naturalHeight);
        } catch (e) { /* fall back to text wordmark */ }
        done();
      };
      img.onerror = done;
      img.src = "findrix-logo.png";
      setTimeout(done, 1500);
    });
  }

  async function generate() {
    await loadLogo();
    doc = new jsPDF({ unit: "pt", format: "a4" });
    y = 0;
    renderHero();
    renderCats();
    renderGaps();
    renderPlan();
    renderLongterm();
    renderChecklist();
    drawFooters();
    doc.save("susinsight-ai-visibility-audit.pdf");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("download-pdf");
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (btn.dataset.busy) return;
      btn.dataset.busy = "1";
      const original = btn.textContent;
      btn.textContent = "Preparing...";
      setTimeout(() => {
        generate().catch((err) => {
          console.error("PDF export failed:", err);
          window.__pdfErr = (err && err.stack) || String(err);
        }).finally(() => {
          btn.dataset.busy = "";
          btn.textContent = original;
        });
      }, 30);
    });
  });
})();
