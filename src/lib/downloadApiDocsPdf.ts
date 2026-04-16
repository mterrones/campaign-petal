import html2pdf from "html2pdf.js";

const pdfOptions = {
  margin: [12, 10, 12, 10] as [number, number, number, number],
  filename: "enviamas-api-documentacion.pdf",
  image: { type: "jpeg" as const, quality: 0.92 },
  html2canvas: { scale: 2, useCORS: true, logging: false },
  jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
  pagebreak: { mode: ["css", "legacy"] as const },
};

export async function downloadApiDocumentationPdf(
  singleSection: HTMLElement,
  bulkSection: HTMLElement,
): Promise<void> {
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;left:-12000px;top:0;width:190mm;max-width:720px;background:#ffffff;color:#171717;padding:12px 20px 28px;font-family:system-ui,-apple-system,sans-serif;font-size:11px;line-height:1.45;box-sizing:border-box;";

  const header = document.createElement("div");
  header.innerHTML =
    "<h1 style=\"font-size:18px;font-weight:700;margin:0 0 6px;\">EnviaMas — API</h1>" +
    "<p style=\"margin:0 0 18px;color:#525252;font-size:10px;\">Documentación: envío individual y envío masivo</p>";
  container.appendChild(header);

  const hSingle = document.createElement("h2");
  hSingle.textContent = "Envío individual";
  hSingle.style.cssText =
    "font-size:13px;font-weight:700;margin:0 0 12px;padding-bottom:8px;border-bottom:1px solid #e5e5e5;";
  container.appendChild(hSingle);
  container.appendChild(singleSection.cloneNode(true) as HTMLElement);

  const hBulk = document.createElement("h2");
  hBulk.textContent = "Envío masivo";
  hBulk.style.cssText =
    "font-size:13px;font-weight:700;margin:28px 0 12px;padding-bottom:8px;border-bottom:1px solid #e5e5e5;";
  container.appendChild(hBulk);
  container.appendChild(bulkSection.cloneNode(true) as HTMLElement);

  document.body.appendChild(container);
  try {
    await html2pdf().set(pdfOptions).from(container).save();
  } finally {
    document.body.removeChild(container);
  }
}
