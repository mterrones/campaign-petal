import { EmailBlock, InnerBlock, GlobalEmailStyles, COLUMN_LAYOUTS, SOCIAL_NETWORKS } from "./types";

function wrap(content: string, pad: string, align?: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"><tr><td style="${pad}${align ? `text-align:${align};` : ""}">${content}</td></tr></table>`;
}

function fontStack(ff: string): string {
  const safe = "Arial, Helvetica, sans-serif";
  if (ff.toLowerCase().includes("arial")) return safe;
  return `${ff}, ${safe}`;
}

function renderSocialIcons(content: Record<string, string>): string {
  const size = content.iconSize || "24";
  return SOCIAL_NETWORKS.filter(sn => content[sn.key]).map(sn => {
    const colors: Record<string, string> = { facebook: "#1877F2", instagram: "#E4405F", twitter: "#000000", linkedin: "#0A66C2", youtube: "#FF0000" };
    const color = content.iconStyle === "color" ? colors[sn.key] || "#666666" : "#666666";
    return `<a href="${content[sn.key]}" target="_blank" style="display:inline-block;margin:0 6px;text-decoration:none;color:${color};font-size:${size}px;font-weight:bold;mso-line-height-rule:exactly;">${sn.label.charAt(0)}</a>`;
  }).join("");
}

function pad(c: Record<string, string>): string {
  return `padding:${c.paddingTop || "0"}px ${c.paddingRight || "0"}px ${c.paddingBottom || "0"}px ${c.paddingLeft || "0"}px;`;
}

function renderInnerBlockHtml(block: InnerBlock, gs: GlobalEmailStyles): string {
  const c = block.content;
  const p = pad(c);
  const ff = fontStack(gs.fontFamily);

  switch (block.type) {
    case "heading": {
      const tag = c.level || "h1";
      const fs = c.fontSize || "24";
      return wrap(
        `<${tag} style="margin:0;color:${c.color || "#1a1a2e"};font-size:${fs}px;font-weight:${c.bold === "true" ? "bold" : "normal"};font-style:${c.italic === "true" ? "italic" : "normal"};font-family:${ff};mso-line-height-rule:exactly;text-align:${c.align || "left"};">${c.text}</${tag}>`,
        p
      );
    }
    case "text":
      return wrap(
        `<p style="margin:0;color:${c.color || "#4a4a5a"};font-size:${c.fontSize || "14"}px;line-height:${c.lineHeight || "1.6"};font-family:${ff};mso-line-height-rule:exactly;">${c.text}</p>`,
        p
      );
    case "image": {
      const w = c.width || "100";
      const img = `<img src="${c.url}" alt="${c.alt || ""}" width="${w === "100" ? "100%" : w + "%"}" border="0" style="display:block;width:${w}%;height:auto;border:0;outline:none;text-decoration:none;" />`;
      const wrapped = c.linkUrl ? `<a href="${c.linkUrl}" target="_blank" style="text-decoration:none;">${img}</a>` : img;
      const caption = c.caption ? `<p style="font-size:12px;color:#999999;margin:4px 0 0;font-family:${ff};">${c.caption}</p>` : "";
      return wrap(wrapped + caption, p, c.align || "center");
    }
    case "button": {
      return renderBulletproofButton(c, gs);
    }
    case "spacer": {
      const h = c.height || "40";
      return `<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"><tr><td height="${h}" style="font-size:${h}px;line-height:${h}px;mso-line-height-rule:exactly;">&nbsp;</td></tr></table>`;
    }
    case "social":
      return wrap(renderSocialIcons(c), "padding:8px 0;", c.align || "center");
    case "video": {
      const thumb = c.thumbnailUrl || "https://placehold.co/600x340/1a1a2e/ffffff?text=%E2%96%B6";
      return wrap(
        `<a href="${c.url}" target="_blank" style="text-decoration:none;"><img src="${thumb}" alt="Video" width="100%" border="0" style="display:block;width:100%;height:auto;border:0;" /></a>`,
        "padding:12px 0;", "center"
      );
    }
    default:
      return "";
  }
}

function renderBulletproofButton(c: Record<string, string>, gs: GlobalEmailStyles): string {
  const ff = fontStack(gs.fontFamily);
  const bgColor = c.bgColor || "#3b82f6";
  const textColor = c.textColor || "#ffffff";
  const text = c.text || "Click";
  const url = c.url || "#";
  const fs = c.fontSize || "14";
  const isOutline = c.style === "outline";
  const radius = c.style === "pill" ? "25" : (c.borderRadius || "8");
  const fullWidth = c.buttonWidth === "full";
  const align = c.align || "center";
  const p = pad(c);

  const tdBg = isOutline ? "transparent" : bgColor;
  const tdBorder = isOutline ? `2px solid ${bgColor}` : "none";
  const aColor = isOutline ? bgColor : textColor;

  const btnTable = `<table cellpadding="0" cellspacing="0" border="0" role="presentation"${fullWidth ? ' width="100%"' : ''} style="${fullWidth ? "width:100%;" : ""}"><tr><td align="center" bgcolor="${tdBg}" style="background-color:${tdBg};border:${tdBorder};border-radius:${radius}px;mso-border-alt:none;"><a href="${url}" target="_blank" style="display:inline-block;padding:12px 28px;color:${aColor};font-size:${fs}px;font-weight:600;font-family:${ff};text-decoration:none;text-align:center;mso-line-height-rule:exactly;${fullWidth ? "width:100%;box-sizing:border-box;" : ""}">${text}</a></td></tr></table>`;

  // VML bulletproof for Outlook
  const w = fullWidth ? "100%" : "auto";
  const vml = `<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:auto;v-text-anchor:middle;width:${w};" arcsize="${Math.round(parseInt(radius) / 20 * 100)}%" ${isOutline ? `strokecolor="${bgColor}" strokeweight="2px" fillcolor="transparent"` : `strokecolor="${bgColor}" fillcolor="${bgColor}"`}><w:anchorlock/><center style="color:${aColor};font-family:${ff};font-size:${fs}px;font-weight:600;">${text}</center></v:roundrect><![endif]--><!--[if !mso]><!-->${btnTable}<!--<![endif]-->`;

  return wrap(vml, p, align);
}

function renderBlockHtml(block: EmailBlock, gs: GlobalEmailStyles): string {
  const c = block.content;
  const p = pad(c);
  const ff = fontStack(gs.fontFamily);

  switch (block.type) {
    case "heading":
    case "text":
    case "image":
    case "button":
    case "spacer":
    case "social":
    case "video":
      return renderInnerBlockHtml(block as any, gs);

    case "divider": {
      const thickness = c.thickness || "1";
      const color = c.color || "#e5e7eb";
      const style = c.lineStyle || "solid";
      const w = c.width || "100";
      return `<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"><tr><td style="padding:${c.paddingTop || "20"}px 0 ${c.paddingBottom || "20"}px;"><table width="${w}%" align="center" cellpadding="0" cellspacing="0" border="0" role="presentation"><tr><td style="border-top:${thickness}px ${style} ${color};font-size:1px;line-height:1px;mso-line-height-rule:exactly;">&nbsp;</td></tr></table></td></tr></table>`;
    }

    case "columns": {
      const layout = COLUMN_LAYOUTS.find(l => l.value === (c.layout || "50-50")) || COLUMN_LAYOUTS[0];
      const gap = parseInt(c.gap || "16");
      const emailW = parseInt(gs.emailWidth) || 600;
      const cols = (block.columns || []).map((col, i) => {
        const colW = Math.round(emailW * layout.widths[i] / 100);
        return `<!--[if mso]><td width="${colW}" valign="top" style="width:${colW}px;"><![endif]--><td style="width:${layout.widths[i]}%;vertical-align:top;padding:0 ${gap / 2}px;" valign="top">${col.map(inner => renderInnerBlockHtml(inner, gs)).join("")}</td><!--[if mso]></td><![endif]-->`;
      }).join("");
      return wrap(
        `<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"><tr>${cols}</tr></table>`,
        p
      );
    }

    case "footer":
      return `<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"><tr><td align="center" style="padding:24px 16px;color:${c.color || "#9ca3af"};font-size:${c.fontSize || "12"}px;font-family:${ff};mso-line-height-rule:exactly;">
        <p style="margin:0 0 8px;">${c.text}</p>
        ${c.address ? `<p style="margin:0 0 8px;">${c.address}</p>` : ""}
        ${c.showUnsubscribe === "true" ? `<a href="#" style="color:${c.color || "#9ca3af"};text-decoration:underline;">${c.unsubscribeText || "Cancelar suscripción"}</a>` : ""}
      </td></tr></table>`;

    case "html":
      return c.code || "";

    case "logo":
      return `<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"><tr><td align="${c.align || "center"}" style="padding:16px 0;"><img src="${c.url}" alt="${c.alt || ""}" width="${c.width || "200"}" border="0" style="display:block;width:${c.width || "200"}px;height:auto;border:0;outline:none;" />${c.companyName ? `<p style="font-size:14px;font-weight:600;margin:8px 0 0;font-family:${ff};">${c.companyName}</p>` : ""}</td></tr></table>`;

    case "menu": {
      let items: { text: string; url: string }[] = [];
      try { items = JSON.parse(c.items || "[]"); } catch {}
      const sep = c.separator || "|";
      const menuHtml = items.map((item, i) =>
        `${i > 0 ? ` <span style="color:#cccccc;margin:0 8px;">${sep}</span> ` : ""}<a href="${item.url}" style="color:${c.color || "#3b82f6"};text-decoration:none;font-family:${ff};">${item.text}</a>`
      ).join("");
      return `<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"><tr><td align="${c.align || "center"}" style="padding:12px 0;font-family:${ff};font-size:${c.fontSize || "14"}px;">${menuHtml}</td></tr></table>`;
    }

    default:
      return "";
  }
}

export function exportHtml(blocks: EmailBlock[], globalStyles: GlobalEmailStyles, subject: string): string {
  const ff = fontStack(globalStyles.fontFamily);
  const ew = globalStyles.emailWidth || "600";
  const content = blocks.map(b => renderBlockHtml(b, globalStyles)).join("\n");

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="es">
<head>
<meta charset="UTF-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
<title>${subject}</title>
<!--[if mso]>
<noscript>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
</noscript>
<![endif]-->
<style>
  /* CSS Reset */
  body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
  img { -ms-interpolation-mode:bicubic; border:0; height:auto; line-height:100%; outline:none; text-decoration:none; }
  body { height:100% !important; margin:0 !important; padding:0 !important; width:100% !important; }
  a[x-apple-data-detectors] { color:inherit !important; text-decoration:none !important; font-size:inherit !important; font-family:inherit !important; font-weight:inherit !important; line-height:inherit !important; }
  #MessageViewBody a { color:inherit; text-decoration:none; font-size:inherit; font-family:inherit; font-weight:inherit; line-height:inherit; }
  .ExternalClass { width:100%; }
  .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height:100%; }
  a { color:${globalStyles.linkColor}; }
</style>
</head>
<body style="margin:0;padding:0;background-color:${globalStyles.bodyBgColor};font-family:${ff};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;" bgcolor="${globalStyles.bodyBgColor}">
${globalStyles.preheaderText ? `<div style="display:none;font-size:1px;color:${globalStyles.bodyBgColor};line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${globalStyles.preheaderText}${"&zwnj;&nbsp;".repeat(30)}</div>` : ""}
<!--[if mso]>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:${globalStyles.padding}px 0;">
<table role="presentation" width="${ew}" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${globalStyles.contentBgColor}">
<![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${globalStyles.bodyBgColor};" bgcolor="${globalStyles.bodyBgColor}">
<tr><td align="center" style="padding:${globalStyles.padding}px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:${ew}px;width:100%;background-color:${globalStyles.contentBgColor};" bgcolor="${globalStyles.contentBgColor}">
<tr><td style="padding:0;">
${content}
</td></tr>
</table>
</td></tr>
</table>
<!--[if mso]>
</td></tr></table>
</td></tr></table>
<![endif]-->
</body>
</html>`;
}
