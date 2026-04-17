export type BlockType = "heading" | "text" | "image" | "button" | "divider" | "columns" | "spacer" | "social" | "footer" | "video" | "html" | "logo" | "menu" | "unsubscribe";
export type InnerBlockType = "heading" | "text" | "image" | "button" | "spacer" | "social" | "video";

export interface InnerBlock {
  id: string;
  type: InnerBlockType;
  content: Record<string, string>;
}

export interface EmailBlock {
  id: string;
  type: BlockType;
  content: Record<string, string>;
  columns?: InnerBlock[][];
}

export interface GlobalEmailStyles {
  bodyBgColor: string;
  contentBgColor: string;
  fontFamily: string;
  emailWidth: string;
  padding: string;
  linkColor: string;
  preheaderText: string;
  senderName: string;
  senderEmail: string;
  replyTo: string;
}

export interface DragState {
  draggedBlockId: string | null;
  draggedNewType: BlockType | null;
  dropIndex: number | null;
  draggedInner: { blockId: string; colIndex: number; innerId: string } | null;
  draggedInnerNewType: InnerBlockType | null;
  innerDropTarget: { blockId: string; colIndex: number; innerIndex: number } | null;
}

export const COLUMN_LAYOUTS: { label: string; value: string; widths: number[] }[] = [
  { label: "50 / 50", value: "50-50", widths: [50, 50] },
  { label: "33 / 33 / 33", value: "33-33-33", widths: [33.33, 33.33, 33.33] },
  { label: "70 / 30", value: "70-30", widths: [70, 30] },
  { label: "30 / 70", value: "30-70", widths: [30, 70] },
  { label: "25 / 50 / 25", value: "25-50-25", widths: [25, 50, 25] },
];

export const FONT_OPTIONS = [
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Roboto", value: "'Roboto', sans-serif" },
  { label: "Open Sans", value: "'Open Sans', sans-serif" },
  { label: "Lato", value: "'Lato', sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
];

export const SOCIAL_NETWORKS = [
  { key: "facebook", label: "Facebook", icon: "facebook" },
  { key: "instagram", label: "Instagram", icon: "instagram" },
  { key: "twitter", label: "X (Twitter)", icon: "twitter" },
  { key: "linkedin", label: "LinkedIn", icon: "linkedin" },
  { key: "youtube", label: "YouTube", icon: "youtube" },
];

export const defaultContent: Record<string, Record<string, string>> = {
  heading: { text: "Título principal", align: "center", level: "h1", color: "#1a1a2e", fontSize: "24", fontFamily: "", bold: "true", italic: "false", paddingTop: "16", paddingBottom: "16", paddingLeft: "0", paddingRight: "0" },
  text: { text: "Escribe tu contenido aquí. Puedes agregar párrafos, enlaces y más.", color: "#4a4a5a", fontSize: "14", lineHeight: "1.6", paddingTop: "12", paddingBottom: "12", paddingLeft: "0", paddingRight: "0" },
  image: { url: "https://placehold.co/600x200/3b82f6/ffffff?text=Tu+Imagen", alt: "Imagen", width: "100", borderRadius: "8", linkUrl: "", caption: "", align: "center", paddingTop: "12", paddingBottom: "12", paddingLeft: "0", paddingRight: "0" },
  button: { text: "Click Aquí", url: "#", align: "center", bgColor: "#3b82f6", textColor: "#ffffff", borderRadius: "8", buttonWidth: "auto", fontSize: "14", paddingTop: "16", paddingBottom: "16", paddingLeft: "0", paddingRight: "0", style: "filled" },
  divider: { lineStyle: "solid", color: "#e5e7eb", thickness: "1", width: "100", paddingTop: "20", paddingBottom: "20" },
  columns: { layout: "50-50", gap: "16", paddingTop: "12", paddingBottom: "12" },
  spacer: { height: "40" },
  social: { facebook: "", instagram: "", twitter: "", linkedin: "", youtube: "", iconStyle: "color", iconSize: "24", align: "center" },
  footer: { text: "© 2026 Tu Empresa. Todos los derechos reservados.", address: "Calle Ejemplo 123, Ciudad, País", showUnsubscribe: "true", unsubscribeText: "Cancelar suscripción", color: "#9ca3af", fontSize: "12" },
  video: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnailUrl: "https://placehold.co/600x340/1a1a2e/ffffff?text=▶+Video", playButtonText: "Ver Video" },
  html: { code: "<p style='color:#666;'>Tu HTML personalizado aquí</p>" },
  logo: { url: "https://placehold.co/200x60/3b82f6/ffffff?text=LOGO", alt: "Logo", companyName: "Tu Empresa", align: "center", width: "200" },
  menu: { items: JSON.stringify([{ text: "Inicio", url: "#" }, { text: "Productos", url: "#" }, { text: "Contacto", url: "#" }]), align: "center", color: "#3b82f6", fontSize: "14", separator: "|" },
  unsubscribe: {
    text: "Darse de baja",
    align: "center",
    color: "#9ca3af",
    fontSize: "12",
    paddingTop: "16",
    paddingBottom: "24",
    paddingLeft: "16",
    paddingRight: "16",
  },
};

export const blockTypes: { type: BlockType; label: string; icon: string }[] = [
  { type: "heading", label: "Título", icon: "Type" },
  { type: "text", label: "Texto", icon: "AlignLeft" },
  { type: "image", label: "Imagen", icon: "Image" },
  { type: "button", label: "Botón", icon: "Square" },
  { type: "divider", label: "Separador", icon: "Minus" },
  { type: "columns", label: "Columnas", icon: "Columns" },
  { type: "spacer", label: "Espaciador", icon: "ArrowUpDown" },
  { type: "social", label: "Redes", icon: "Share2" },
  { type: "footer", label: "Footer", icon: "FileText" },
  { type: "video", label: "Video", icon: "Play" },
  { type: "html", label: "HTML", icon: "Code" },
  { type: "logo", label: "Logo", icon: "Image" },
  { type: "menu", label: "Menú", icon: "Menu" },
  { type: "unsubscribe", label: "Baja", icon: "UserMinus" },
];

export const innerBlockTypes: { type: InnerBlockType; label: string; icon: string }[] = [
  { type: "heading", label: "Título", icon: "Type" },
  { type: "text", label: "Texto", icon: "AlignLeft" },
  { type: "image", label: "Imagen", icon: "Image" },
  { type: "button", label: "Botón", icon: "Square" },
  { type: "spacer", label: "Espaciador", icon: "ArrowUpDown" },
  { type: "social", label: "Redes", icon: "Share2" },
  { type: "video", label: "Video", icon: "Play" },
];

export const defaultGlobalStyles: GlobalEmailStyles = {
  bodyBgColor: "#f3f4f6",
  contentBgColor: "#ffffff",
  fontFamily: "'Inter', sans-serif",
  emailWidth: "600",
  padding: "32",
  linkColor: "#3b82f6",
  preheaderText: "",
  senderName: "Tu Empresa",
  senderEmail: "tu@empresa.com",
  replyTo: "tu@empresa.com",
};
