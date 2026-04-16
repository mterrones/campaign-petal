// Generates a printable HTML document in a new window and triggers the
// native browser "Save as PDF" dialog. This avoids html2canvas/CSS-variable
// issues that produced blank PDFs with html2pdf.js.

function collectStyles(): string {
  const parts: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = (sheet as CSSStyleSheet).cssRules;
      if (!rules) continue;
      for (const rule of Array.from(rules)) {
        parts.push(rule.cssText);
      }
    } catch {
      // Cross-origin stylesheet — skip.
    }
  }
  return parts.join("\n");
}

const printCss = `
  @page { size: A4; margin: 14mm; }
  html, body { background: #ffffff !important; color: #171717 !important; }
  body { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; font-size: 11px; line-height: 1.5; padding: 0; margin: 0; }
  h1 { font-size: 20px; font-weight: 700; margin: 0 0 4px; }
  h2 { font-size: 14px; font-weight: 700; margin: 24px 0 10px; padding-bottom: 6px; border-bottom: 1px solid #e5e5e5; }
  .doc-header { margin-bottom: 18px; }
  .doc-header p { margin: 0; color: #525252; font-size: 11px; }
  pre, code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 10px; white-space: pre-wrap; word-break: break-word; }
  pre { background: #f5f5f5; padding: 10px; border-radius: 6px; border: 1px solid #e5e5e5; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #e5e5e5; padding: 6px 8px; text-align: left; vertical-align: top; font-size: 10px; }
  th { background: #fafafa; font-weight: 600; }
  .card, [class*="rounded-"] { box-shadow: none !important; }
  button { display: none !important; }
  [data-radix-scroll-area-viewport] { overflow: visible !important; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
`;

export async function downloadApiDocumentationPdf(
  apiKeySection: HTMLElement,
): Promise<void> {
  const printWindow = window.open("", "_blank", "width=900,height=1000");
  if (!printWindow) {
    throw new Error("No se pudo abrir la ventana de impresión. Permite las ventanas emergentes.");
  }

  const styles = collectStyles();
  const apiKeyHtml = (apiKeySection.cloneNode(true) as HTMLElement).outerHTML;

  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>EnviaMas — API · Documentación</title>
<style>${styles}</style>
<style>${printCss}</style>
</head>
<body>
  <div class="doc-header">
    <h1>EnviaMas — API</h1>
    <p>API Key · POST y GET /v1/messages</p>
  </div>
  <h2>Mensajes (API Key)</h2>
  ${apiKeyHtml}
</body>
</html>`);
  printWindow.document.close();

  // Wait for fonts and layout, then trigger print.
  await new Promise<void>((resolve) => {
    const trigger = () => {
      try {
        printWindow.focus();
        printWindow.print();
      } finally {
        resolve();
      }
    };
    if (printWindow.document.readyState === "complete") {
      setTimeout(trigger, 350);
    } else {
      printWindow.addEventListener("load", () => setTimeout(trigger, 350), { once: true });
    }
  });
}
