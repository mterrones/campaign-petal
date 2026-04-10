import { EmailBlock, InnerBlock, GlobalEmailStyles, COLUMN_LAYOUTS, SOCIAL_NETWORKS } from "./types";

function renderSocialIcons(content: Record<string, string>): string {
  const size = content.iconSize || "24";
  return SOCIAL_NETWORKS.filter(sn => content[sn.key]).map(sn => {
    const colors: Record<string, string> = { facebook: "#1877F2", instagram: "#E4405F", twitter: "#000000", linkedin: "#0A66C2", youtube: "#FF0000" };
    const color = content.iconStyle === "color" ? colors[sn.key] || "#666" : "#666";
    return `<a href="${content[sn.key]}" target="_blank" style="display:inline-block;margin:0 6px;text-decoration:none;color:${color};font-size:${size}px;font-weight:bold;">${sn.label.charAt(0)}</a>`;
  }).join("");
}

function renderInnerBlockHtml(block: InnerBlock, globalStyles: GlobalEmailStyles): string {
  const c = block.content;
  const pad = `padding:${c.paddingTop || 0}px ${c.paddingRight || 0}px ${c.paddingBottom || 0}px ${c.paddingLeft || 0}px;`;
  switch (block.type) {
    case "heading": {
      const tag = c.level || "h1";
      return `<${tag} style="${pad}text-align:${c.align || "left"};color:${c.color || "#1a1a2e"};font-size:${c.fontSize || 24}px;font-weight:${c.bold === "true" ? "bold" : "normal"};font-style:${c.italic === "true" ? "italic" : "normal"};font-family:${c.fontFamily || globalStyles.fontFamily};margin:0;">${c.text}</${tag}>`;
    }
    case "text":
      return `<p style="${pad}color:${c.color || "#4a4a5a"};font-size:${c.fontSize || 14}px;line-height:${c.lineHeight || 1.6};font-family:${globalStyles.fontFamily};margin:0;">${c.text}</p>`;
    case "image": {
      const img = `<img src="${c.url}" alt="${c.alt || ""}" style="width:${c.width || 100}%;border-radius:${c.borderRadius || 0}px;display:block;" />`;
      const wrapped = c.linkUrl ? `<a href="${c.linkUrl}" target="_blank">${img}</a>` : img;
      return `<div style="${pad}text-align:${c.align || "center"};">${wrapped}${c.caption ? `<p style="font-size:12px;color:#999;margin:4px 0 0;">${c.caption}</p>` : ""}</div>`;
    }
    case "button": {
      const btnStyle = c.style === "outline" ? `border:2px solid ${c.bgColor || "#3b82f6"};background:transparent;color:${c.bgColor || "#3b82f6"};` : `background-color:${c.bgColor || "#3b82f6"};color:${c.textColor || "#fff"};`;
      const radius = c.style === "pill" ? "25px" : `${c.borderRadius || 8}px`;
      const width = c.buttonWidth === "full" ? "display:block;width:100%;text-align:center;" : "display:inline-block;";
      return `<div style="${pad}text-align:${c.align || "center"};"><a href="${c.url || "#"}" style="${width}padding:12px 28px;${btnStyle}border-radius:${radius};text-decoration:none;font-size:${c.fontSize || 14}px;font-weight:600;font-family:${globalStyles.fontFamily};">${c.text}</a></div>`;
    }
    case "spacer":
      return `<div style="height:${c.height || 40}px;"></div>`;
    case "social":
      return `<div style="text-align:${c.align || "center"};padding:8px 0;">${renderSocialIcons(c)}</div>`;
    case "video": {
      const thumb = c.thumbnailUrl || "https://placehold.co/600x340/1a1a2e/ffffff?text=▶";
      return `<div style="text-align:center;padding:12px 0;"><a href="${c.url}" target="_blank"><img src="${thumb}" alt="Video" style="width:100%;border-radius:8px;" /></a></div>`;
    }
    default:
      return "";
  }
}

function renderBlockHtml(block: EmailBlock, globalStyles: GlobalEmailStyles): string {
  const c = block.content;
  const pad = `padding:${c.paddingTop || 0}px ${c.paddingRight || 0}px ${c.paddingBottom || 0}px ${c.paddingLeft || 0}px;`;

  switch (block.type) {
    case "heading":
    case "text":
    case "image":
    case "button":
    case "spacer":
    case "social":
    case "video":
      return renderInnerBlockHtml(block as any, globalStyles);
    case "divider":
      return `<div style="padding:${c.paddingTop || 20}px 0 ${c.paddingBottom || 20}px;"><hr style="border:none;border-top:${c.thickness || 1}px ${c.lineStyle || "solid"} ${c.color || "#e5e7eb"};width:${c.width || 100}%;margin:0 auto;" /></div>`;
    case "columns": {
      const layout = COLUMN_LAYOUTS.find(l => l.value === (c.layout || "50-50")) || COLUMN_LAYOUTS[0];
      const gap = c.gap || "16";
      const cols = (block.columns || []).map((col, i) =>
        `<td style="width:${layout.widths[i]}%;vertical-align:top;padding:0 ${parseInt(gap) / 2}px;">${col.map(inner => renderInnerBlockHtml(inner, globalStyles)).join("")}</td>`
      ).join("");
      return `<div style="${pad}"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${cols}</tr></table></div>`;
    }
    case "footer":
      return `<div style="text-align:center;padding:24px 16px;color:${c.color || "#9ca3af"};font-size:${c.fontSize || 12}px;font-family:${globalStyles.fontFamily};">
        <p style="margin:0 0 8px;">${c.text}</p>
        ${c.address ? `<p style="margin:0 0 8px;">${c.address}</p>` : ""}
        ${c.showUnsubscribe === "true" ? `<a href="#" style="color:${c.color || "#9ca3af"};text-decoration:underline;">${c.unsubscribeText || "Cancelar suscripción"}</a>` : ""}
      </div>`;
    case "html":
      return c.code || "";
    case "logo":
      return `<div style="text-align:${c.align || "center"};padding:16px 0;"><img src="${c.url}" alt="${c.alt || ""}" style="width:${c.width || 200}px;" />${c.companyName ? `<p style="font-size:14px;font-weight:600;margin:8px 0 0;font-family:${globalStyles.fontFamily};">${c.companyName}</p>` : ""}</div>`;
    case "menu": {
      let items: { text: string; url: string }[] = [];
      try { items = JSON.parse(c.items || "[]"); } catch {}
      const sep = c.separator || "|";
      return `<div style="text-align:${c.align || "center"};padding:12px 0;font-family:${globalStyles.fontFamily};font-size:${c.fontSize || 14}px;">${items.map((item, i) =>
        `${i > 0 ? ` <span style="color:#ccc;margin:0 8px;">${sep}</span> ` : ""}<a href="${item.url}" style="color:${c.color || "#3b82f6"};text-decoration:none;">${item.text}</a>`
      ).join("")}</div>`;
    }
    default:
      return "";
  }
}

export function exportHtml(blocks: EmailBlock[], globalStyles: GlobalEmailStyles, subject: string): string {
  const content = blocks.map(b => renderBlockHtml(b, globalStyles)).join("\n");
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${subject}</title>
${globalStyles.preheaderText ? `<span style="display:none;font-size:1px;color:#fff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${globalStyles.preheaderText}</span>` : ""}
<style>
  body { margin:0; padding:0; background-color:${globalStyles.bodyBgColor}; font-family:${globalStyles.fontFamily}; }
  img { max-width:100%; height:auto; }
  a { color:${globalStyles.linkColor}; }
</style>
</head>
<body style="margin:0;padding:0;background-color:${globalStyles.bodyBgColor};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td align="center" style="padding:${globalStyles.padding}px 16px;">
<table role="presentation" width="${globalStyles.emailWidth}" cellpadding="0" cellspacing="0" border="0" style="max-width:${globalStyles.emailWidth}px;width:100%;background-color:${globalStyles.contentBgColor};border-radius:8px;">
<tr><td style="padding:0;">
${content}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
