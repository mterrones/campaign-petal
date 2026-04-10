export interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: "draft" | "sending" | "sent" | "scheduled" | "paused";
  recipients: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  createdAt: string;
  sentAt?: string;
  scheduledAt?: string;
}

export interface ContactDirectory {
  id: string;
  name: string;
  color: string;
  count?: number;
}

export interface Contact {
  id: string;
  email: string;
  name: string;
  lastName: string;
  tags: string[];
  status: "active" | "unsubscribed" | "bounced";
  createdAt: string;
  list: string;
  directoryId: string;
}

export const campaigns: Campaign[] = [
  {
    id: "1",
    name: "Newsletter Abril 2026",
    subject: "Las últimas novedades de este mes",
    status: "sent",
    recipients: 12450,
    delivered: 12102,
    opened: 4320,
    clicked: 1890,
    bounced: 348,
    unsubscribed: 23,
    createdAt: "2026-04-01",
    sentAt: "2026-04-05",
  },
  {
    id: "2",
    name: "Promo Semana Santa",
    subject: "🎉 Ofertas exclusivas para ti",
    status: "sent",
    recipients: 8900,
    delivered: 8654,
    opened: 3210,
    clicked: 1450,
    bounced: 246,
    unsubscribed: 15,
    createdAt: "2026-03-20",
    sentAt: "2026-03-28",
  },
  {
    id: "3",
    name: "Lanzamiento Producto",
    subject: "Conoce nuestro nuevo producto",
    status: "sending",
    recipients: 15000,
    delivered: 9800,
    opened: 0,
    clicked: 0,
    bounced: 120,
    unsubscribed: 0,
    createdAt: "2026-04-08",
  },
  {
    id: "4",
    name: "Encuesta de satisfacción",
    subject: "Tu opinión nos importa",
    status: "scheduled",
    recipients: 5600,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0,
    createdAt: "2026-04-07",
    scheduledAt: "2026-04-15",
  },
  {
    id: "5",
    name: "Bienvenida nuevos suscriptores",
    subject: "¡Bienvenido a nuestra comunidad!",
    status: "draft",
    recipients: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0,
    createdAt: "2026-04-09",
  },
];

export const defaultDirectories: ContactDirectory[] = [
  { id: "all", name: "Todos", color: "hsl(var(--primary))" },
  { id: "general", name: "General", color: "hsl(210, 70%, 50%)" },
  { id: "vip", name: "VIP", color: "hsl(45, 90%, 50%)" },
  { id: "promos", name: "Promos", color: "hsl(150, 60%, 45%)" },
  { id: "leads", name: "Leads", color: "hsl(280, 60%, 55%)" },
];

export const contacts: Contact[] = [
  { id: "1", email: "maria.garcia@email.com", name: "María", lastName: "García", tags: ["VIP", "Newsletter"], status: "active", createdAt: "2026-01-15", list: "General", directoryId: "general" },
  { id: "2", email: "carlos.lopez@email.com", name: "Carlos", lastName: "López", tags: ["Newsletter"], status: "active", createdAt: "2026-02-10", list: "General", directoryId: "general" },
  { id: "3", email: "ana.martinez@email.com", name: "Ana", lastName: "Martínez", tags: ["VIP", "Promos"], status: "active", createdAt: "2026-01-20", list: "Promos", directoryId: "vip" },
  { id: "4", email: "juan.rodriguez@email.com", name: "Juan", lastName: "Rodríguez", tags: ["Newsletter"], status: "unsubscribed", createdAt: "2025-11-05", list: "General", directoryId: "general" },
  { id: "5", email: "laura.sanchez@email.com", name: "Laura", lastName: "Sánchez", tags: ["Promos"], status: "bounced", createdAt: "2026-03-01", list: "Promos", directoryId: "promos" },
  { id: "6", email: "pedro.fernandez@email.com", name: "Pedro", lastName: "Fernández", tags: ["VIP"], status: "active", createdAt: "2026-02-28", list: "VIP", directoryId: "vip" },
  { id: "7", email: "sofia.ruiz@email.com", name: "Sofía", lastName: "Ruiz", tags: ["Newsletter", "Promos"], status: "active", createdAt: "2026-03-15", list: "General", directoryId: "leads" },
  { id: "8", email: "diego.moreno@email.com", name: "Diego", lastName: "Moreno", tags: ["Newsletter"], status: "active", createdAt: "2026-04-01", list: "General", directoryId: "general" },
];

export const dashboardStats = {
  totalContacts: 24580,
  totalCampaigns: 47,
  avgOpenRate: 34.7,
  avgClickRate: 15.2,
};
