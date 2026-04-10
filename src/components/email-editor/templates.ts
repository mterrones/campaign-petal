import { EmailBlock, GlobalEmailStyles, defaultGlobalStyles } from "./types";

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  blocks: EmailBlock[];
  globalStyles?: Partial<GlobalEmailStyles>;
}

let idCounter = 1;
const uid = () => `tpl-${idCounter++}`;

export const emailTemplates: EmailTemplate[] = [
  {
    id: "blank",
    name: "En Blanco",
    description: "Empieza desde cero con un canvas vacío",
    thumbnail: "https://placehold.co/280x180/f9fafb/9ca3af?text=En+Blanco",
    blocks: [],
  },
  {
    id: "newsletter",
    name: "Newsletter",
    description: "Plantilla clásica de newsletter con artículos destacados",
    thumbnail: "https://placehold.co/280x180/3b82f6/ffffff?text=Newsletter",
    blocks: [
      { id: uid(), type: "logo", content: { url: "https://placehold.co/200x60/3b82f6/ffffff?text=LOGO", alt: "Logo", companyName: "Tu Marca", align: "center", width: "180" } },
      { id: uid(), type: "menu", content: { items: JSON.stringify([{ text: "Inicio", url: "#" }, { text: "Blog", url: "#" }, { text: "Tienda", url: "#" }]), align: "center", color: "#3b82f6", fontSize: "14", separator: "•" } },
      { id: uid(), type: "divider", content: { lineStyle: "solid", color: "#e5e7eb", thickness: "1", width: "100", paddingTop: "8", paddingBottom: "8" } },
      { id: uid(), type: "image", content: { url: "https://placehold.co/600x250/3b82f6/ffffff?text=Imagen+Principal", alt: "Hero", width: "100", borderRadius: "8", linkUrl: "", caption: "", align: "center", paddingTop: "12", paddingBottom: "12", paddingLeft: "0", paddingRight: "0" } },
      { id: uid(), type: "heading", content: { text: "¡Novedades de la semana!", align: "center", level: "h1", color: "#1a1a2e", fontSize: "28", fontFamily: "", bold: "true", italic: "false", paddingTop: "16", paddingBottom: "8", paddingLeft: "0", paddingRight: "0" } },
      { id: uid(), type: "text", content: { text: "Te traemos las últimas noticias y artículos más relevantes. No te pierdas ningún detalle.", color: "#4a4a5a", fontSize: "15", lineHeight: "1.6", paddingTop: "0", paddingBottom: "16", paddingLeft: "0", paddingRight: "0" } },
      { id: uid(), type: "columns", content: { layout: "50-50", gap: "16", paddingTop: "12", paddingBottom: "12" }, columns: [
        [
          { id: uid(), type: "image", content: { url: "https://placehold.co/280x160/10b981/ffffff?text=Artículo+1", alt: "Art 1", width: "100", borderRadius: "8", linkUrl: "", caption: "", align: "center", paddingTop: "0", paddingBottom: "8", paddingLeft: "0", paddingRight: "0" } },
          { id: uid(), type: "heading", content: { text: "Artículo Destacado", align: "left", level: "h3", color: "#1a1a2e", fontSize: "18", fontFamily: "", bold: "true", italic: "false", paddingTop: "0", paddingBottom: "4", paddingLeft: "0", paddingRight: "0" } },
          { id: uid(), type: "text", content: { text: "Descubre las tendencias que marcarán este año.", color: "#4a4a5a", fontSize: "13", lineHeight: "1.5", paddingTop: "0", paddingBottom: "8", paddingLeft: "0", paddingRight: "0" } },
          { id: uid(), type: "button", content: { text: "Leer más", url: "#", align: "left", bgColor: "#3b82f6", textColor: "#ffffff", borderRadius: "6", buttonWidth: "auto", fontSize: "13", paddingTop: "0", paddingBottom: "0", paddingLeft: "0", paddingRight: "0", style: "filled" } },
        ],
        [
          { id: uid(), type: "image", content: { url: "https://placehold.co/280x160/f59e0b/ffffff?text=Artículo+2", alt: "Art 2", width: "100", borderRadius: "8", linkUrl: "", caption: "", align: "center", paddingTop: "0", paddingBottom: "8", paddingLeft: "0", paddingRight: "0" } },
          { id: uid(), type: "heading", content: { text: "Guía Práctica", align: "left", level: "h3", color: "#1a1a2e", fontSize: "18", fontFamily: "", bold: "true", italic: "false", paddingTop: "0", paddingBottom: "4", paddingLeft: "0", paddingRight: "0" } },
          { id: uid(), type: "text", content: { text: "Paso a paso para maximizar tus resultados.", color: "#4a4a5a", fontSize: "13", lineHeight: "1.5", paddingTop: "0", paddingBottom: "8", paddingLeft: "0", paddingRight: "0" } },
          { id: uid(), type: "button", content: { text: "Leer más", url: "#", align: "left", bgColor: "#3b82f6", textColor: "#ffffff", borderRadius: "6", buttonWidth: "auto", fontSize: "13", paddingTop: "0", paddingBottom: "0", paddingLeft: "0", paddingRight: "0", style: "filled" } },
        ],
      ] },
      { id: uid(), type: "divider", content: { lineStyle: "solid", color: "#e5e7eb", thickness: "1", width: "100", paddingTop: "16", paddingBottom: "16" } },
      { id: uid(), type: "social", content: { facebook: "https://facebook.com", instagram: "https://instagram.com", twitter: "https://x.com", linkedin: "", youtube: "", iconStyle: "color", iconSize: "24", align: "center" } },
      { id: uid(), type: "footer", content: { text: "© 2026 Tu Marca. Todos los derechos reservados.", address: "Calle Ejemplo 123, Ciudad", showUnsubscribe: "true", unsubscribeText: "Cancelar suscripción", color: "#9ca3af", fontSize: "12" } },
    ],
  },
  {
    id: "promotion",
    name: "Promoción",
    description: "Ideal para anunciar ofertas y descuentos especiales",
    thumbnail: "https://placehold.co/280x180/ef4444/ffffff?text=Promoción",
    blocks: [
      { id: uid(), type: "logo", content: { url: "https://placehold.co/200x60/ef4444/ffffff?text=TIENDA", alt: "Logo", companyName: "Mi Tienda", align: "center", width: "180" } },
      { id: uid(), type: "image", content: { url: "https://placehold.co/600x300/ef4444/ffffff?text=🔥+OFERTA+ESPECIAL", alt: "Promo", width: "100", borderRadius: "0", linkUrl: "", caption: "", align: "center", paddingTop: "0", paddingBottom: "0", paddingLeft: "0", paddingRight: "0" } },
      { id: uid(), type: "heading", content: { text: "¡Hasta 50% de descuento!", align: "center", level: "h1", color: "#ef4444", fontSize: "32", fontFamily: "", bold: "true", italic: "false", paddingTop: "24", paddingBottom: "8", paddingLeft: "0", paddingRight: "0" } },
      { id: uid(), type: "text", content: { text: "Solo por tiempo limitado. Aprovecha los mejores precios del año en toda nuestra colección.", color: "#4a4a5a", fontSize: "16", lineHeight: "1.6", paddingTop: "0", paddingBottom: "16", paddingLeft: "20", paddingRight: "20" } },
      { id: uid(), type: "button", content: { text: "COMPRAR AHORA", url: "#", align: "center", bgColor: "#ef4444", textColor: "#ffffff", borderRadius: "25", buttonWidth: "full", fontSize: "16", paddingTop: "16", paddingBottom: "16", paddingLeft: "24", paddingRight: "24", style: "pill" } },
      { id: uid(), type: "spacer", content: { height: "20" } },
      { id: uid(), type: "footer", content: { text: "© 2026 Mi Tienda. No responder a este email.", address: "", showUnsubscribe: "true", unsubscribeText: "Darme de baja", color: "#9ca3af", fontSize: "11" } },
    ],
  },
  {
    id: "welcome",
    name: "Bienvenida",
    description: "Email de bienvenida para nuevos suscriptores",
    thumbnail: "https://placehold.co/280x180/10b981/ffffff?text=Bienvenida",
    blocks: [
      { id: uid(), type: "logo", content: { url: "https://placehold.co/200x60/10b981/ffffff?text=MARCA", alt: "Logo", companyName: "Mi Marca", align: "center", width: "160" } },
      { id: uid(), type: "spacer", content: { height: "20" } },
      { id: uid(), type: "heading", content: { text: "¡Bienvenido a bordo! 🎉", align: "center", level: "h1", color: "#1a1a2e", fontSize: "28", fontFamily: "", bold: "true", italic: "false", paddingTop: "16", paddingBottom: "8", paddingLeft: "0", paddingRight: "0" } },
      { id: uid(), type: "text", content: { text: "Estamos encantados de tenerte con nosotros. A partir de ahora recibirás las mejores novedades, tips y ofertas exclusivas directamente en tu bandeja de entrada.", color: "#4a4a5a", fontSize: "15", lineHeight: "1.7", paddingTop: "0", paddingBottom: "16", paddingLeft: "16", paddingRight: "16" } },
      { id: uid(), type: "image", content: { url: "https://placehold.co/500x200/10b981/ffffff?text=Bienvenido", alt: "Welcome", width: "90", borderRadius: "12", linkUrl: "", caption: "", align: "center", paddingTop: "0", paddingBottom: "16", paddingLeft: "0", paddingRight: "0" } },
      { id: uid(), type: "button", content: { text: "Explorar", url: "#", align: "center", bgColor: "#10b981", textColor: "#ffffff", borderRadius: "8", buttonWidth: "auto", fontSize: "15", paddingTop: "16", paddingBottom: "24", paddingLeft: "0", paddingRight: "0", style: "filled" } },
      { id: uid(), type: "social", content: { facebook: "#", instagram: "#", twitter: "#", linkedin: "#", youtube: "", iconStyle: "color", iconSize: "24", align: "center" } },
      { id: uid(), type: "footer", content: { text: "© 2026 Mi Marca", address: "", showUnsubscribe: "true", unsubscribeText: "Cancelar suscripción", color: "#9ca3af", fontSize: "12" } },
    ],
  },
  {
    id: "event",
    name: "Evento",
    description: "Invitación a eventos, webinars o conferencias",
    thumbnail: "https://placehold.co/280x180/8b5cf6/ffffff?text=Evento",
    blocks: [
      { id: uid(), type: "logo", content: { url: "https://placehold.co/200x60/8b5cf6/ffffff?text=EVENTO", alt: "Logo", companyName: "Mi Evento", align: "center", width: "180" } },
      { id: uid(), type: "heading", content: { text: "Estás Invitado 🎤", align: "center", level: "h1", color: "#8b5cf6", fontSize: "30", fontFamily: "", bold: "true", italic: "false", paddingTop: "24", paddingBottom: "8", paddingLeft: "0", paddingRight: "0" } },
      { id: uid(), type: "text", content: { text: "No te pierdas nuestro próximo webinar sobre las últimas tendencias de la industria. Reserva tu lugar ahora.", color: "#4a4a5a", fontSize: "15", lineHeight: "1.6", paddingTop: "0", paddingBottom: "16", paddingLeft: "20", paddingRight: "20" } },
      { id: uid(), type: "image", content: { url: "https://placehold.co/600x280/8b5cf6/ffffff?text=📅+15+de+Mayo+2026", alt: "Evento", width: "100", borderRadius: "12", linkUrl: "", caption: "", align: "center", paddingTop: "0", paddingBottom: "16", paddingLeft: "0", paddingRight: "0" } },
      { id: uid(), type: "button", content: { text: "REGISTRARME", url: "#", align: "center", bgColor: "#8b5cf6", textColor: "#ffffff", borderRadius: "8", buttonWidth: "auto", fontSize: "16", paddingTop: "16", paddingBottom: "24", paddingLeft: "0", paddingRight: "0", style: "filled" } },
      { id: uid(), type: "footer", content: { text: "© 2026 Eventos Inc.", address: "", showUnsubscribe: "true", unsubscribeText: "No me interesa", color: "#9ca3af", fontSize: "12" } },
    ],
  },
];
