export type WebsiteStatus = "sem_site" | "site_proprio" | "redes_sociais" | "nao_confirmado";

export type LeadStatus =
  | "Novo lead"
  | "Não contatado"
  | "Mensagem gerada"
  | "Mensagem enviada"
  | "Aguardando resposta"
  | "Interessado"
  | "Site em desenvolvimento"
  | "Proposta enviada"
  | "Cliente fechado"
  | "Não interessado";

export type Lead = {
  id: string;
  placeId?: string;
  name: string;
  category: string;
  address: string;
  city: string;
  rating: number | null;
  reviewCount: number;
  phone: string | null;
  whatsapp: string | null;
  instagram?: string | null;
  website?: string | null;
  websiteStatus: WebsiteStatus;
  mapsUrl?: string | null;
  score: number;
  status: LeadStatus;
  notes: string;
  proposalValue: string;
  foundAt: string;
  lastContact?: string | null;
  source: "google_places" | "demo";
  activities: Array<{ id: string; label: string; date: string }>;
};

export function classifyWebsite(website?: string | null, socialLinks: string[] = []): WebsiteStatus {
  if (website) {
    const normalized = website.toLowerCase();
    const socialOnly = ["instagram.com", "facebook.com", "linktr.ee", "ifood.com", "uber.com"].some(host => normalized.includes(host));
    return socialOnly ? "redes_sociais" : "site_proprio";
  }
  if (socialLinks.length > 0) return "redes_sociais";
  return "sem_site";
}

export function calculateLeadScore(input: {
  rating?: number | null;
  reviewCount?: number;
  websiteStatus: WebsiteStatus;
  phone?: string | null;
  whatsapp?: string | null;
  category?: string | null;
}): number {
  let score = 0;
  const rating = input.rating ?? 0;
  const reviews = input.reviewCount ?? 0;
  if (rating >= 4.7) score += 30;
  else if (rating >= 4.5) score += 24;
  else if (rating >= 4.2) score += 18;
  else if (rating >= 4) score += 12;
  if (reviews >= 300) score += 22;
  else if (reviews >= 100) score += 17;
  else if (reviews >= 40) score += 11;
  else if (reviews >= 10) score += 5;
  if (input.websiteStatus === "sem_site") score += 26;
  if (input.websiteStatus === "redes_sociais") score += 20;
  if (input.websiteStatus === "nao_confirmado") score += 6;
  if (input.phone) score += 10;
  if (input.whatsapp) score += 8;
  if (input.category) score += 4;
  return Math.min(score, 100);
}

export function getBrasiliaGreeting(date = new Date()): "bom dia" | "boa tarde" | "boa noite" {
  const hour = Number(new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    hour12: false,
  }).format(date));
  if (hour < 12) return "bom dia";
  if (hour < 18) return "boa tarde";
  return "boa noite";
}

export function buildApproachMessage(companyName: string, date = new Date()) {
  return `Oi, ${getBrasiliaGreeting(date)}. Quem é o responsável pela ${companyName}? Montei uma coisa com o nome de vocês e queria mostrar pro dono ou responsável antes de qualquer coisa. É só um print.`;
}

export function normalizeBrazilianPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\\D/g, "");
  if (!digits) return null;
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  const national = withCountry.slice(2);
  if (![10, 11].includes(national.length)) return null;
  return `55${national}`;
}

export function buildWhatsAppUrl(phone: string | null | undefined, message: string) {
  const normalized = normalizeBrazilianPhone(phone);
  if (!normalized) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export const statusStyles: Record<LeadStatus, string> = {
  "Novo lead": "status-neutral",
  "Não contatado": "status-neutral",
  "Mensagem gerada": "status-blue",
  "Mensagem enviada": "status-blue",
  "Aguardando resposta": "status-amber",
  "Interessado": "status-green",
  "Site em desenvolvimento": "status-violet",
  "Proposta enviada": "status-amber",
  "Cliente fechado": "status-green",
  "Não interessado": "status-red",
};

export const allLeadStatuses: LeadStatus[] = [
  "Novo lead",
  "Não contatado",
  "Mensagem gerada",
  "Mensagem enviada",
  "Aguardando resposta",
  "Interessado",
  "Site em desenvolvimento",
  "Proposta enviada",
  "Cliente fechado",
  "Não interessado",
];
