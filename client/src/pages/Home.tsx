import {
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleAlert,
  Clipboard,
  Clock3,
  Copy,
  Database,
  ExternalLink,
  FileText,
  Globe2,
  History,
  Instagram,
  LayoutDashboard,
  Loader2,
  MapPin,
  Menu,
  MessageSquareText,
  Monitor,
  MoreHorizontal,
  MousePointer2,
  Phone,
  Plus,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Tablet,
  Target,
  TrendingUp,
  UsersRound,
  Wand2,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  allLeadStatuses,
  buildApproachMessage,
  buildWhatsAppUrl,
  statusStyles,
  type Lead,
  type LeadStatus,
} from "@/lib/prospecting";

const LEADS_KEY = "prospecta-leads-v1";
const SITES_KEY = "prospecta-sites-v1";

type SiteRecord = {
  id: string;
  leadId: string;
  leadName: string;
  category: string;
  status: "Briefing pronto" | "Em edição" | "Pronto para publicar" | "Publicado";
  createdAt: string;
  accent: string;
};

const demoLeads: Lead[] = [
  {
    id: "demo-bistro-horizonte",
    name: "Bistrô Horizonte",
    category: "Restaurante",
    address: "Av. das Acácias, 842 · Cuiabá, MT",
    city: "Cuiabá, MT",
    rating: 4.8,
    reviewCount: 286,
    phone: null,
    whatsapp: null,
    instagram: "@bistrohorizonte",
    website: null,
    websiteStatus: "sem_site",
    mapsUrl: null,
    score: 92,
    status: "Novo lead",
    notes: "Negócio com reputação forte e presença digital limitada.",
    proposalValue: "",
    foundAt: "Hoje, 09:42",
    lastContact: null,
    source: "demo",
    activities: [{ id: "demo-a1", label: "Lead incluído na demonstração", date: "Hoje, 09:42" }],
  },
  {
    id: "demo-clinica-orbe",
    name: "Clínica Orbe",
    category: "Clínica odontológica",
    address: "Rua dos Ipês, 115 · Sinop, MT",
    city: "Sinop, MT",
    rating: 4.7,
    reviewCount: 174,
    phone: null,
    whatsapp: null,
    instagram: "@clinicaorbe",
    website: null,
    websiteStatus: "redes_sociais",
    mapsUrl: null,
    score: 86,
    status: "Mensagem gerada",
    notes: "Instagram ativo, sem domínio institucional identificado.",
    proposalValue: "",
    foundAt: "Ontem, 16:18",
    lastContact: null,
    source: "demo",
    activities: [
      { id: "demo-a2", label: "Mensagem de abordagem gerada", date: "Ontem, 16:22" },
      { id: "demo-a3", label: "Lead incluído na demonstração", date: "Ontem, 16:18" },
    ],
  },
  {
    id: "demo-barbearia-norte",
    name: "Barbearia Norte",
    category: "Barbearia",
    address: "Rua das Palmeiras, 390 · Sinop, MT",
    city: "Sinop, MT",
    rating: 4.6,
    reviewCount: 98,
    phone: null,
    whatsapp: null,
    instagram: "@barbearianorte",
    website: null,
    websiteStatus: "sem_site",
    score: 82,
    status: "Aguardando resposta",
    notes: "Boa oportunidade para uma página com foco em agendamento.",
    proposalValue: "",
    foundAt: "21 nov, 14:06",
    lastContact: "21 nov, 14:22",
    source: "demo",
    activities: [
      { id: "demo-a4", label: "Mensagem enviada manualmente", date: "21 nov, 14:22" },
      { id: "demo-a5", label: "Lead incluído na demonstração", date: "21 nov, 14:06" },
    ],
  },
];

const navItems = [
  { label: "Visão geral", path: "/", icon: LayoutDashboard },
  { label: "Encontrar empresas", path: "/leads", icon: Search },
  { label: "Meus leads", path: "/crm", icon: UsersRound },
  { label: "Mensagens", path: "/mensagens", icon: MessageSquareText },
  { label: "Sites gerados", path: "/sites", icon: Globe2 },
];

const formatNumber = (value: number) => new Intl.NumberFormat("pt-BR").format(value);
const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function readStorage<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function usePersistedState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readStorage(key, fallback));
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Local persistence is best-effort in restricted previews.
    }
  }, [key, value]);
  return [value, setValue] as const;
}

function StatusPill({ status }: { status: LeadStatus }) {
  return <span className={`status-pill ${statusStyles[status]}`}><span className="status-dot" />{status}</span>;
}

function MetricCard({ label, value, trend, icon: Icon, tone = "mint" }: { label: string; value: string; trend?: string; icon: typeof Target; tone?: "mint" | "blue" | "amber" | "violet" }) {
  return (
    <article className={`metric-card tone-${tone}`}>
      <header className="metric-header"><span>{label}</span><span className="metric-icon"><Icon size={17} strokeWidth={1.8} /></span></header>
      <strong>{value}</strong>
      {trend ? <small><TrendingUp size={13} /> {trend}</small> : <small className="muted-small">A partir dos leads salvos</small>}
    </article>
  );
}

function WebsiteBadge({ status }: { status: Lead["websiteStatus"] }) {
  const config = {
    sem_site: { label: "Sem site", className: "badge-opportunity" },
    site_proprio: { label: "Site próprio", className: "badge-neutral" },
    redes_sociais: { label: "Só redes sociais", className: "badge-social" },
    nao_confirmado: { label: "Não confirmado", className: "badge-warning" },
  }[status];
  return <span className={`website-badge ${config.className}`}>{config.label}</span>;
}

function LeadCard({ lead, onSelect, onMessage, onSite }: { lead: Lead; onSelect: (lead: Lead) => void; onMessage: (lead: Lead) => void; onSite: (lead: Lead) => void }) {
  return (
    <article className="lead-card" onClick={() => onSelect(lead)}>
      <header className="lead-card-header">
        <div className="lead-avatar">{lead.name.slice(0, 1).toUpperCase()}</div>
        <div className="lead-card-title"><h3>{lead.name}</h3><span>{lead.category}</span></div>
        <button className="icon-button subtle" aria-label={`Mais opções para ${lead.name}`} onClick={event => event.stopPropagation()}><MoreHorizontal size={18} /></button>
      </header>
      <div className="lead-location"><MapPin size={14} /> <span>{lead.address}</span></div>
      <div className="lead-card-metrics">
        <span><Star size={14} fill="currentColor" /> {lead.rating?.toFixed(1) ?? "—"}</span>
        <span>{formatNumber(lead.reviewCount)} avaliações</span>
        <span className="score"><Zap size={13} /> {lead.score}</span>
      </div>
      <div className="lead-card-badges"><WebsiteBadge status={lead.websiteStatus} />{lead.source === "demo" && <span className="demo-chip">Demonstração</span>}</div>
      <footer className="lead-card-footer">
        <StatusPill status={lead.status} />
        <div className="lead-actions">
          <button className="text-action" onClick={event => { event.stopPropagation(); onMessage(lead); }}><MessageSquareText size={14} /> Mensagem</button>
          <button className="text-action primary-text" onClick={event => { event.stopPropagation(); onSite(lead); }}><Sparkles size={14} /> Gerar site</button>
        </div>
      </footer>
    </article>
  );
}

function Sidebar({ location, collapsed, onNavigate, onClose }: { location: string; collapsed: boolean; onNavigate: (path: string) => void; onClose: () => void }) {
  return (
    <aside className={`app-sidebar ${collapsed ? "is-collapsed" : ""}`}>
      <header className="brand-lockup">
        <span className="brand-mark">P</span>
        {!collapsed && <span className="brand-name">prospecta<span>.</span></span>}
        <button className="sidebar-close" onClick={onClose} aria-label="Fechar menu"><X size={18} /></button>
      </header>
      {!collapsed && <p className="workspace-label">WORKSPACE <span>PRO</span></p>}
      <nav className="primary-nav">
        {navItems.map(item => {
          const active = location === item.path || (item.path === "/leads" && location === "/leads");
          return <button key={item.path} className={`nav-item ${active ? "active" : ""}`} onClick={() => onNavigate(item.path)} title={collapsed ? item.label : undefined}><item.icon size={18} strokeWidth={active ? 2.2 : 1.8} />{!collapsed && <span>{item.label}</span>}{!collapsed && active && <ChevronRight className="nav-arrow" size={15} />}</button>;
        })}
      </nav>
      {!collapsed && <div className="sidebar-divider" />}
      {!collapsed && <p className="workspace-label">SISTEMA</p>}
      <nav className="primary-nav secondary-nav">
        <button className={`nav-item ${location === "/configuracoes" ? "active" : ""}`} onClick={() => onNavigate("/configuracoes")} title={collapsed ? "Configurações" : undefined}><Settings2 size={18} />{!collapsed && <span>Configurações</span>}</button>
        <button className="nav-item" onClick={() => toast.info("Central de ajuda em preparação")} title={collapsed ? "Ajuda" : undefined}><CircleAlert size={18} />{!collapsed && <span>Ajuda e suporte</span>}</button>
      </nav>
      <footer className="sidebar-footer">
        <div className="account-avatar">M</div>
        {!collapsed && <div className="account-info"><strong>Meu workspace</strong><span>Plano profissional</span></div>}
        {!collapsed && <button className="icon-button subtle" onClick={() => toast.info("Preferências da conta em preparação")}><MoreHorizontal size={17} /></button>}
      </footer>
    </aside>
  );
}

function Topbar({ location, onMenu, onSearch }: { location: string; onMenu: () => void; onSearch: (value: string) => void }) {
  const current = navItems.find(item => item.path === location)?.label ?? (location === "/configuracoes" ? "Configurações" : "Prospecta");
  return <header className="topbar"><div className="topbar-title"><button className="mobile-menu" onClick={onMenu} aria-label="Abrir menu"><Menu size={20} /></button><span className="breadcrumb-muted">Workspace /</span><strong>{current}</strong></div><div className="topbar-actions"><label className="global-search"><Search size={16} /><input placeholder="Buscar leads, empresas..." onChange={event => onSearch(event.target.value)} /><kbd>⌘ K</kbd></label><button className="notification-button" onClick={() => toast.info("Você está em dia")}><span className="notification-dot" /><Clock3 size={18} /></button><div className="top-avatar">M</div></div></header>;
}

function EmptyState({ onDemo, onSearch }: { onDemo: () => void; onSearch: () => void }) {
  return <section className="empty-state"><span className="empty-icon"><Database size={24} /></span><h3>Nenhum lead encontrado ainda</h3><p>Conecte uma busca real do Google Maps ou carregue uma demonstração para explorar o fluxo completo.</p><div className="empty-actions"><button className="button button-primary" onClick={onSearch}><Search size={16} /> Encontrar empresas</button><button className="button button-secondary" onClick={onDemo}>Carregar demonstração</button></div></section>;
}

function Dashboard({ leads, onNavigate, onSelect, onMessage, onSite, onDemo }: { leads: Lead[]; onNavigate: (path: string) => void; onSelect: (lead: Lead) => void; onMessage: (lead: Lead) => void; onSite: (lead: Lead) => void; onDemo: () => void }) {
  const withoutWebsite = leads.filter(lead => ["sem_site", "redes_sociais"].includes(lead.websiteStatus)).length;
  const qualified = leads.filter(lead => lead.score >= 70).length;
  const messages = leads.filter(lead => ["Mensagem gerada", "Mensagem enviada", "Aguardando resposta", "Interessado", "Cliente fechado"].includes(lead.status)).length;
  const closed = leads.filter(lead => lead.status === "Cliente fechado").length;
  const latest = [...leads].sort((a, b) => b.score - a.score).slice(0, 3);
  return <>
    <section className="page-intro dashboard-intro"><div><p className="eyebrow"><span className="eyebrow-pulse" /> Visão geral</p><h1>Bom dia, Modelo<span className="title-period">.</span></h1><p className="intro-copy">Transforme cada oportunidade em uma próxima conversa.</p></div><div className="intro-actions"><button className="button button-secondary" onClick={() => onNavigate("/leads")}><Search size={16} /> Encontrar empresas</button><button className="button button-primary" onClick={() => onDemo()}><Plus size={16} /> Nova demonstração</button></div></section>
    <div className="demo-banner"><span className="demo-banner-icon"><ShieldCheck size={16} /></span><span><strong>Modo demonstração ativo.</strong> Os dados atuais são exemplos para validar o fluxo. Resultados reais só entram por uma busca conectada ao Google Places.</span><button onClick={() => onNavigate("/leads")}>Configurar busca <ArrowUpRight size={14} /></button></div>
    <section className="metrics-grid"><MetricCard label="Empresas encontradas" value={formatNumber(leads.length)} trend="base ativa" icon={BriefcaseBusiness} tone="blue" /><MetricCard label="Sem site identificado" value={formatNumber(withoutWebsite)} trend={leads.length ? `${Math.round((withoutWebsite / leads.length) * 100)}% da base` : undefined} icon={Globe2} tone="mint" /><MetricCard label="Leads qualificados" value={formatNumber(qualified)} trend="score acima de 70" icon={Target} tone="violet" /><MetricCard label="Clientes fechados" value={formatNumber(closed)} trend={messages ? `${messages} mensagens no fluxo` : undefined} icon={TrendingUp} tone="amber" /></section>
    <section className="dashboard-columns"><article className="panel pipeline-panel"><header className="panel-header"><div><p className="eyebrow">Pipeline comercial</p><h2>Onde estão suas oportunidades</h2></div><button className="icon-button subtle" onClick={() => onNavigate("/leads")}><ArrowUpRight size={17} /></button></header><div className="pipeline-chart"><div className="chart-axis"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div><div className="chart-area"><div className="chart-gridlines"><i /><i /><i /><i /><i /></div><svg viewBox="0 0 620 180" preserveAspectRatio="none" role="img" aria-label="Evolução do pipeline"><defs><linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#20D9C4" stopOpacity=".28" /><stop offset="100%" stopColor="#20D9C4" stopOpacity="0" /></linearGradient></defs><path d="M0,150 C70,148 80,116 140,120 S190,142 245,104 S310,80 370,91 S430,110 475,74 S535,56 620,33 L620,180 L0,180 Z" fill="url(#areaFill)" /><path d="M0,150 C70,148 80,116 140,120 S190,142 245,104 S310,80 370,91 S430,110 475,74 S535,56 620,33" fill="none" stroke="#14B8A6" strokeWidth="3" strokeLinecap="round" /></svg><div className="chart-labels"><span>22 out</span><span>29 out</span><span>05 nov</span><span>12 nov</span><span>19 nov</span></div></div></div><div className="pipeline-legend"><span><i className="legend-dot mint-dot" /> Leads qualificados <strong>{qualified}</strong></span><span><i className="legend-dot violet-dot" /> Em conversa <strong>{messages}</strong></span><span><i className="legend-dot amber-dot" /> Fechados <strong>{closed}</strong></span></div></article><article className="panel opportunity-panel"><header className="panel-header"><div><p className="eyebrow">Atalho inteligente</p><h2>Próxima melhor ação</h2></div><span className="sparkle-mark"><Sparkles size={17} /></span></header><div className="opportunity-copy"><p>Você tem <strong>{leads.filter(lead => lead.status === "Novo lead").length} leads novos</strong> esperando uma primeira abordagem.</p><span>Comece por quem já tem boa reputação e ainda não tem um site próprio.</span></div><button className="button button-primary full-button" onClick={() => onNavigate("/leads")}><Zap size={16} /> Ver oportunidades</button><div className="opportunity-foot"><span><Wifi size={13} /> Lead Score ativo</span><button onClick={() => onNavigate("/configuracoes")}>Ajustar pesos <ChevronRight size={13} /></button></div></article></section>
    <section className="panel recent-panel"><header className="panel-header"><div><p className="eyebrow">Base recente</p><h2>Leads para acompanhar</h2></div><button className="button button-tertiary" onClick={() => onNavigate("/leads")}>Ver todos <ArrowUpRight size={14} /></button></header>{latest.length ? <div className="lead-list-compact">{latest.map(lead => <button className="compact-lead" key={lead.id} onClick={() => onSelect(lead)}><span className="compact-avatar">{lead.name.slice(0, 1)}</span><span className="compact-main"><strong>{lead.name}</strong><small>{lead.category} · {lead.city}</small></span><span className="compact-rating"><Star size={13} fill="currentColor" /> {lead.rating?.toFixed(1) ?? "—"}</span><span className="compact-score">{lead.score}<small>score</small></span><StatusPill status={lead.status} /><ChevronRight size={16} className="compact-chevron" /></button>)}</div> : <EmptyState onDemo={onDemo} onSearch={() => onNavigate("/leads")} />}</section>
    <p className="page-footnote"><ShieldCheck size={13} /> Dados e regras de qualificação ficam no seu workspace. Nenhuma mensagem é enviada automaticamente.</p>
  </>;
}

function SearchView({ leads, onAddLeads, onSelect, onMessage, onSite, onDemo }: { leads: Lead[]; onAddLeads: (leads: Lead[]) => void; onSelect: (lead: Lead) => void; onMessage: (lead: Lead) => void; onSite: (lead: Lead) => void; onDemo: () => void }) {
  const [niche, setNiche] = useState("");
  const [location, setLocation] = useState("");
  const [ratingMin, setRatingMin] = useState("4.5");
  const [reviewsMin, setReviewsMin] = useState("20");
  const [limit, setLimit] = useState("10");
  const [withoutWebsite, setWithoutWebsite] = useState(true);
  const searchMutation = trpc.prospecting.search.useMutation({
    onSuccess: results => {
      const now = new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
      const mapped: Lead[] = results.map(result => ({ ...result, status: "Novo lead", notes: "", proposalValue: "", foundAt: now, lastContact: null, source: "google_places", activities: [{ id: uid("activity"), label: "Encontrado via Google Places", date: now }] }));
      onAddLeads(mapped);
      toast.success(`${mapped.length} empresa${mapped.length === 1 ? "" : "s"} adicionada${mapped.length === 1 ? "" : "s"} à sua base.`);
    },
    onError: error => toast.error(error.message.includes("credentials") || error.message.includes("configured") ? "O proxy do Google Places ainda não está configurado." : `Não foi possível concluir a busca: ${error.message}`),
  });
  const realLeads = leads.filter(lead => lead.source === "google_places");
  const doSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (!niche.trim() || !location.trim()) {
      toast.error("Informe o nicho e a localização para pesquisar.");
      return;
    }
    searchMutation.mutate({ niche: niche.trim(), location: location.trim(), ratingMin: Number(ratingMin), reviewsMin: Number(reviewsMin), limit: Number(limit), withoutWebsite });
  };
  return <><section className="page-intro search-intro"><div><p className="eyebrow"><Search size={13} /> Descoberta</p><h1>Encontrar empresas<span className="title-period">.</span></h1><p className="intro-copy">Encontre negócios com reputação e espaço para uma presença digital melhor.</p></div><div className="search-integrity"><ShieldCheck size={15} /><span>Fonte: Google Places</span></div></section><section className="search-layout"><form className="search-form panel" onSubmit={doSearch}><div className="search-form-header"><div><p className="eyebrow">Nova pesquisa</p><h2>Defina sua oportunidade</h2></div><span className="secure-badge"><ShieldCheck size={13} /> Dados reais</span></div><label className="field-label">O que você quer encontrar<input value={niche} onChange={event => setNiche(event.target.value)} placeholder="Ex.: hamburguerias, clínicas..." /></label><label className="field-label">Onde procurar<input value={location} onChange={event => setLocation(event.target.value)} placeholder="Ex.: Sinop, MT" /></label><div className="form-grid"><label className="field-label">Nota mínima<select value={ratingMin} onChange={event => setRatingMin(event.target.value)}><option value="4">4.0 ou mais</option><option value="4.2">4.2 ou mais</option><option value="4.5">4.5 ou mais</option><option value="4.7">4.7 ou mais</option></select></label><label className="field-label">Mín. avaliações<input type="number" min="0" value={reviewsMin} onChange={event => setReviewsMin(event.target.value)} /></label></div><div className="form-grid"><label className="field-label">Quantidade<select value={limit} onChange={event => setLimit(event.target.value)}><option value="10">Até 10 empresas</option><option value="20">Até 20 empresas</option></select></label><label className="toggle-field"><input type="checkbox" checked={withoutWebsite} onChange={event => setWithoutWebsite(event.target.checked)} /><span className="toggle-track"><i /></span><span>Apenas sem site próprio</span></label></div><button className="button button-primary full-button" type="submit" disabled={searchMutation.isPending}>{searchMutation.isPending ? <><Loader2 size={16} className="spin" /> Buscando no Google Maps...</> : <><Search size={16} /> Pesquisar empresas</>}</button><div className="search-note"><CircleAlert size={14} /><span>Instagram, Facebook e delivery não contam como site institucional. Dados incompletos ficam como “não confirmado”.</span></div></form><aside className="search-side-panel"><div className="side-stat"><span className="side-stat-icon"><Target size={17} /></span><div><strong>{formatNumber(realLeads.length)}</strong><span>resultados reais salvos</span></div></div><div className="side-divider" /><p className="eyebrow">Como funciona</p><ol className="process-list"><li><span>01</span><div><strong>Descubra</strong><small>O Google Places encontra negócios no seu nicho.</small></div></li><li><span>02</span><div><strong>Qualifique</strong><small>Nota, volume de avaliações e presença digital viram score.</small></div></li><li><span>03</span><div><strong>Converse</strong><small>Aborde com uma mensagem exata e revise antes de enviar.</small></div></li></ol><button className="button button-secondary full-button" onClick={onDemo}><Sparkles size={15} /> Explorar demonstração</button></aside></section><section className="results-section"><header className="section-heading"><div><p className="eyebrow">Resultados salvos</p><h2>{realLeads.length ? `${realLeads.length} empresas encontradas` : "Sua próxima lista começa aqui"}</h2></div>{realLeads.length > 0 && <button className="button button-tertiary" onClick={() => toast.info("Filtros avançados em preparação")}><SlidersHorizontalIcon /> Mais filtros</button>}</header>{realLeads.length ? <div className="lead-grid">{realLeads.map(lead => <LeadCard key={lead.id} lead={lead} onSelect={onSelect} onMessage={onMessage} onSite={onSite} />)}</div> : <EmptyState onDemo={onDemo} onSearch={() => document.querySelector<HTMLInputElement>("input")?.focus()} />}</section></>;
}

function SlidersHorizontalIcon() { return <Settings2 size={15} />; }

function LeadsView({ leads, onSelect, onMessage, onSite, onDemo }: { leads: Lead[]; onSelect: (lead: Lead) => void; onMessage: (lead: Lead) => void; onSite: (lead: Lead) => void; onDemo: () => void }) {
  const [filter, setFilter] = useState<LeadStatus | "Todos">("Todos");
  const [query, setQuery] = useState("");
  const filtered = leads.filter(lead => (filter === "Todos" || lead.status === filter) && lead.name.toLowerCase().includes(query.toLowerCase())).sort((a, b) => b.score - a.score);
  return <><section className="page-intro"><div><p className="eyebrow"><UsersRound size={13} /> CRM comercial</p><h1>Meus leads<span className="title-period">.</span></h1><p className="intro-copy">Uma visão simples do que precisa avançar agora.</p></div><button className="button button-primary" onClick={onDemo}><Plus size={16} /> Adicionar demonstração</button></section><section className="toolbar panel"><label className="toolbar-search"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar por nome da empresa" /></label><div className="toolbar-divider" /><select value={filter} onChange={event => setFilter(event.target.value as LeadStatus | "Todos")}><option>Todos</option>{allLeadStatuses.map(status => <option key={status}>{status}</option>)}</select><span className="toolbar-count">{filtered.length} {filtered.length === 1 ? "lead" : "leads"}</span></section>{filtered.length ? <section className="lead-grid leads-grid">{filtered.map(lead => <LeadCard key={lead.id} lead={lead} onSelect={onSelect} onMessage={onMessage} onSite={onSite} />)}</section> : <EmptyState onDemo={onDemo} onSearch={() => setFilter("Todos")} />}</>;
}

function MessagesView({ leads, selectedLeadId, onSelectLead, onUpdateLead }: { leads: Lead[]; selectedLeadId: string | null; onSelectLead: (lead: Lead) => void; onUpdateLead: (lead: Lead) => void }) {
  const selected = leads.find(lead => lead.id === selectedLeadId) ?? leads[0] ?? null;
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState(selected ? buildApproachMessage(selected.name) : "");
  useEffect(() => { setMessage(selected ? buildApproachMessage(selected.name) : ""); setCopied(false); }, [selected?.id]);
  const whatsAppUrl = selected ? buildWhatsAppUrl(selected.whatsapp ?? selected.phone, message) : null;
  const generate = () => {
    if (!selected) return;
    setMessage(buildApproachMessage(selected.name));
    onUpdateLead({ ...selected, status: "Mensagem gerada", activities: [{ id: uid("activity"), label: "Mensagem de abordagem gerada", date: "Agora" }, ...selected.activities] });
    toast.success("Mensagem pronta para revisão.");
  };
  const copy = async () => {
    if (!message) return;
    try { await navigator.clipboard.writeText(message); } catch { /* Clipboard can be blocked in preview. */ }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  const openWhatsApp = () => {
    if (!whatsAppUrl) { toast.error("Este lead não tem um telefone válido identificado."); return; }
    window.open(whatsAppUrl, "_blank", "noopener,noreferrer");
    if (selected) onUpdateLead({ ...selected, status: "Mensagem enviada", lastContact: "Agora", activities: [{ id: uid("activity"), label: "Link do WhatsApp aberto para revisão", date: "Agora" }, ...selected.activities] });
  };
  return <><section className="page-intro"><div><p className="eyebrow"><MessageSquareText size={13} /> Abordagem</p><h1>Mensagens<span className="title-period">.</span></h1><p className="intro-copy">Uma mensagem objetiva, no tom certo e sempre sob sua revisão.</p></div><span className="timezone-chip"><Clock3 size={14} /> Horário de Brasília</span></section><section className="message-layout"><aside className="panel message-lead-list"><header className="panel-header"><div><p className="eyebrow">Selecione um lead</p><h2>{leads.length} disponíveis</h2></div><button className="icon-button subtle" onClick={() => toast.info("Selecione um lead da sua base")}> <Plus size={17} /></button></header>{leads.length ? leads.map(lead => <button key={lead.id} className={`message-lead-item ${selected?.id === lead.id ? "selected" : ""}`} onClick={() => onSelectLead(lead)}><span className="compact-avatar">{lead.name.slice(0, 1)}</span><span><strong>{lead.name}</strong><small>{lead.category}</small></span><span className="message-item-score">{lead.score}</span></button>) : <p className="panel-empty-copy">Adicione um lead para preparar uma abordagem.</p>}</aside><article className="panel composer-panel"><header className="composer-header"><div><p className="eyebrow">Mensagem exata</p><h2>{selected ? `Para ${selected.name}` : "Selecione uma empresa"}</h2></div><span className="locked-chip"><ShieldCheck size={13} /> Estrutura protegida</span></header>{selected ? <><div className="message-context"><div className="lead-avatar large">{selected.name.slice(0, 1)}</div><div><strong>{selected.name}</strong><span>{selected.category} · {selected.city}</span></div><WebsiteBadge status={selected.websiteStatus} /></div><textarea className="message-editor" value={message} onChange={event => setMessage(event.target.value)} aria-label="Mensagem de abordagem" /><div className="message-rules"><span><Check size={13} /> Saudação calculada em Brasília</span><span><Check size={13} /> Sem apresentação comercial</span><span><Check size={13} /> Envio sempre manual</span></div><div className="message-actions"><button className="button button-secondary" onClick={copy}>{copied ? <><Check size={16} /> Copiada</> : <><Copy size={16} /> Copiar mensagem</>}</button><button className={`button ${whatsAppUrl ? "button-whatsapp" : "button-disabled"}`} onClick={openWhatsApp} disabled={!whatsAppUrl}><Send size={16} /> {whatsAppUrl ? "Enviar pelo WhatsApp" : "WhatsApp indisponível"}</button></div>{!whatsAppUrl && <p className="validation-note"><CircleAlert size={14} /> O botão fica desabilitado porque não há um telefone validado para este lead.</p>}<button className="regenerate-link" onClick={generate}><Wand2 size={14} /> Gerar novamente com a saudação atual</button></> : <EmptyState onDemo={() => undefined} onSearch={() => undefined} />}</article></section></>;
}

function SitesView({ leads, sites, onGenerate, onExport, onPublish }: { leads: Lead[]; sites: SiteRecord[]; onGenerate: (lead: Lead) => void; onExport: (site: SiteRecord) => void; onPublish: (site: SiteRecord) => void }) {
  const [previewId, setPreviewId] = useState<string | null>(sites[0]?.id ?? null);
  const selectedSite = sites.find(site => site.id === previewId) ?? null;
  const selectedLead = selectedSite ? leads.find(lead => lead.id === selectedSite.leadId) : null;
  return <><section className="page-intro"><div><p className="eyebrow"><Globe2 size={13} /> Studio de sites</p><h1>Sites gerados<span className="title-period">.</span></h1><p className="intro-copy">Transforme os dados reais do lead em um primeiro briefing visual.</p></div><button className="button button-primary" onClick={() => leads[0] ? onGenerate(leads[0]) : toast.info("Adicione um lead primeiro")}><Sparkles size={16} /> Gerar novo site</button></section><div className="studio-notice"><span className="studio-notice-icon"><Wand2 size={16} /></span><div><strong>Direção de arte por negócio</strong><p>O preview usa apenas informações disponíveis no lead. Conteúdo sem fonte fica vazio para você editar depois.</p></div><span className="studio-status"><span className="status-dot" /> Motor pronto</span></div><section className="sites-layout"><div className="sites-list"><header className="section-heading"><div><p className="eyebrow">Projetos do workspace</p><h2>{sites.length} {sites.length === 1 ? "site" : "sites"}</h2></div></header>{sites.length ? sites.map(site => <button className={`site-list-item ${selectedSite?.id === site.id ? "selected" : ""}`} key={site.id} onClick={() => setPreviewId(site.id)}><span className="site-thumb" style={{ background: site.accent }}><span>{site.leadName.slice(0, 1)}</span></span><span className="site-list-copy"><strong>{site.leadName}</strong><small>{site.category}</small><span className="site-status">{site.status}</span></span><ChevronRight size={16} /></button>) : <EmptyState onDemo={() => leads[0] && onGenerate(leads[0])} onSearch={() => toast.info("Abra Encontrar empresas para adicionar um lead real")} />}</div><article className="site-preview-frame">{selectedSite && selectedLead ? <><header className="preview-toolbar"><span><span className="preview-dot red" /><span className="preview-dot yellow" /><span className="preview-dot green" /></span><span className="preview-url">preview.prospecta/{selectedLead.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}</span><span className="preview-modes"><button className="active"><Monitor size={14} /></button><button><Tablet size={14} /></button><button><Smartphone size={14} /></button></span></header><div className="site-preview-content" style={{ "--site-accent": selectedSite.accent } as React.CSSProperties}><div className="preview-site-nav"><strong>{selectedLead.name}</strong><span>Sobre <i>Serviços</i> Contato</span><button>Falar agora <ArrowUpRight size={13} /></button></div><div className="preview-site-hero"><span className="preview-kicker">{selectedLead.category} · {selectedLead.city}</span><h3>Uma presença digital<br /><em>à altura do seu negócio.</em></h3><p>{selectedLead.notes || "Conteúdo real do negócio entra aqui sem inventar informações que ainda não foram confirmadas."}</p><button>Conhecer o negócio <ChevronRight size={15} /></button></div><div className="preview-site-strip"><span><Star size={14} fill="currentColor" /> {selectedLead.rating?.toFixed(1) ?? "—"} avaliação</span><span>{formatNumber(selectedLead.reviewCount)} avaliações no Google</span><span><MapPin size={14} /> {selectedLead.city}</span></div><div className="preview-site-bottom"><span>Design System · {selectedSite.status}</span><span>Preview interno</span></div></div><footer className="preview-footer"><span><ShieldCheck size={14} /> Preview sem publicação</span><div><button className="button button-tertiary" onClick={() => onExport(selectedSite)}><FileText size={14} /> Exportar briefing</button><button className="button button-secondary" onClick={() => onPublish(selectedSite)}><UploadIcon /> Publicar</button></div></footer></> : <div className="preview-empty"><span className="empty-icon"><Monitor size={24} /></span><h3>Selecione um projeto</h3><p>O preview do site aparece aqui quando você gerar um briefing.</p></div>}</article></section></>;
}

function UploadIcon() { return <ArrowUpRight size={15} />; }

function SettingsView() {
  return <><section className="page-intro"><div><p className="eyebrow"><Settings2 size={13} /> Controle do workspace</p><h1>Configurações<span className="title-period">.</span></h1><p className="intro-copy">Ajuste os critérios que definem o que merece sua atenção.</p></div></section><section className="settings-grid"><article className="panel settings-card"><header className="panel-header"><div><p className="eyebrow">Pontuação de oportunidade</p><h2>Lead Score</h2></div><span className="settings-icon"><Zap size={18} /></span></header><p className="settings-description">Os pesos abaixo ordenam os leads sem esconder os dados que geraram a pontuação.</p>{[["Reputação", "30", "Nota e volume de avaliações"], ["Presença digital limitada", "26", "Sem site institucional"], ["Contato disponível", "18", "Telefone ou WhatsApp"], ["Categoria identificada", "04", "Nicho encontrado"]].map(([label, score, hint]) => <div className="weight-row" key={label}><span><strong>{label}</strong><small>{hint}</small></span><span className="weight-value">+{score}</span></div>)}<button className="button button-secondary full-button" onClick={() => toast.info("Edição dos pesos será liberada na próxima etapa")}><PenIcon /> Editar pesos</button></article><article className="panel settings-card"><header className="panel-header"><div><p className="eyebrow">Integrações</p><h2>Fontes conectadas</h2></div><span className="connected-chip"><span className="status-dot" /> 0 conectadas</span></header><p className="settings-description">As chaves ficam no servidor. Nada sensível é enviado para o navegador.</p><div className="integration-row"><span className="integration-logo google">G</span><span><strong>Google Places</strong><small>Busca e detalhes de empresas</small></span><button className="button button-tertiary" onClick={() => toast.info("Configure as credenciais do projeto para conectar")}>Conectar</button></div><div className="integration-row"><span className="integration-logo github">⌘</span><span><strong>GitHub</strong><small>Exportação e versionamento</small></span><button className="button button-tertiary" onClick={() => toast.info("Conexão com GitHub preparada")}>Conectar</button></div><div className="integration-row"><span className="integration-logo vercel">▲</span><span><strong>Vercel / Netlify</strong><small>Publicação dos sites gerados</small></span><button className="button button-tertiary" onClick={() => toast.info("Publicação requer uma conexão autorizada")}>Conectar</button></div></article><article className="panel settings-card full-settings"><header className="panel-header"><div><p className="eyebrow">Privacidade operacional</p><h2>Regras do workspace</h2></div><ShieldCheck size={19} className="settings-verified" /></header><div className="privacy-points"><p><Check size={15} /><span>Mensagens nunca são enviadas automaticamente.</span></p><p><Check size={15} /><span>Leads de demonstração ficam marcados e separados de fontes reais.</span></p><p><Check size={15} /><span>Dados incompletos não são classificados como “sem site” sem evidência.</span></p></div></article></section></>;
}
function PenIcon() { return <MousePointer2 size={15} />; }

function LeadDrawer({ lead, onClose, onUpdate, onMessage, onSite }: { lead: Lead; onClose: () => void; onUpdate: (lead: Lead) => void; onMessage: (lead: Lead) => void; onSite: (lead: Lead) => void }) {
  const [notes, setNotes] = useState(lead.notes);
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const save = () => { onUpdate({ ...lead, notes, status, activities: [{ id: uid("activity"), label: "Lead atualizado no CRM", date: "Agora" }, ...lead.activities] }); toast.success("Lead atualizado."); };
  return <div className="drawer-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}><aside className="lead-drawer"><header className="drawer-header"><span className="eyebrow">Detalhes do lead</span><button className="icon-button" onClick={onClose}><X size={18} /></button></header><div className="drawer-identity"><div className="lead-avatar xlarge">{lead.name.slice(0, 1)}</div><div><h2>{lead.name}</h2><p>{lead.category} · {lead.city}</p></div><span className="drawer-score"><Zap size={14} />{lead.score}<small>score</small></span></div><div className="drawer-tags"><WebsiteBadge status={lead.websiteStatus} /><StatusPill status={lead.status} /></div><div className="drawer-details"><p><MapPin size={15} /><span>{lead.address}</span></p><p><Star size={15} /><span>{lead.rating?.toFixed(1) ?? "—"} com {formatNumber(lead.reviewCount)} avaliações</span></p><p><Phone size={15} /><span>{lead.phone ?? "Telefone não identificado"}</span></p>{lead.instagram && <p><Instagram size={15} /><span>{lead.instagram}</span></p>}</div><div className="drawer-divider" /><label className="field-label">Status<select value={status} onChange={event => setStatus(event.target.value as LeadStatus)}>{allLeadStatuses.map(option => <option key={option}>{option}</option>)}</select></label><label className="field-label">Observações<textarea value={notes} onChange={event => setNotes(event.target.value)} placeholder="Registre contexto para a próxima interação..." /></label><div className="drawer-actions"><button className="button button-primary full-button" onClick={save}><Check size={16} /> Salvar alterações</button><button className="button button-secondary full-button" onClick={() => onMessage(lead)}><MessageSquareText size={16} /> Gerar mensagem</button><button className="button button-secondary full-button" onClick={() => onSite(lead)}><Sparkles size={16} /> Gerar site profissional</button></div><div className="drawer-history"><div className="drawer-history-title"><History size={14} /> Histórico recente</div>{lead.activities.slice(0, 4).map(activity => <p key={activity.id}><span className="history-line" /><span><strong>{activity.label}</strong><small>{activity.date}</small></span></p>)}</div><a className="maps-link" href={lead.mapsUrl ?? "#"} target="_blank" rel="noreferrer" onClick={event => !lead.mapsUrl && event.preventDefault()}><ExternalLink size={14} /> Abrir no Google Maps</a></aside></div>;
}

export default function Home() {
  const [location, setLocation] = useLocation();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [leads, setLeads] = usePersistedState<Lead[]>(LEADS_KEY, demoLeads);
  const [sites, setSites] = usePersistedState<SiteRecord[]>(SITES_KEY, []);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [messageLeadId, setMessageLeadId] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const visibleLeads = useMemo(() => globalSearch.trim() ? leads.filter(lead => `${lead.name} ${lead.category} ${lead.city}`.toLowerCase().includes(globalSearch.toLowerCase())) : leads, [globalSearch, leads]);
  const updateLead = (updated: Lead) => { setLeads(current => current.map(lead => lead.id === updated.id ? updated : lead)); setSelectedLead(current => current?.id === updated.id ? updated : current); };
  const addLeads = (newLeads: Lead[]) => setLeads(current => { const known = new Set(current.map(lead => lead.placeId ?? lead.id)); const unique = newLeads.filter(lead => !known.has(lead.placeId ?? lead.id)); return [...unique, ...current]; });
  const loadDemo = () => { setLeads(demoLeads); toast.success("Demonstração carregada. Estes dados estão marcados como exemplo."); };
  const navigate = (path: string) => { setLocation(path); setMobileMenu(false); };
  const handleMessage = (lead: Lead) => { updateLead({ ...lead, status: "Mensagem gerada", activities: [{ id: uid("activity"), label: "Mensagem de abordagem gerada", date: "Agora" }, ...lead.activities] }); setMessageLeadId(lead.id); navigate("/mensagens"); };
  const handleSite = (lead: Lead) => { const existing = sites.find(site => site.leadId === lead.id); if (existing) { navigate("/sites"); return; } const newSite: SiteRecord = { id: uid("site"), leadId: lead.id, leadName: lead.name, category: lead.category, status: "Briefing pronto", createdAt: "Agora", accent: lead.category.toLowerCase().includes("clínica") ? "#DCEFF0" : lead.category.toLowerCase().includes("barbear") ? "#E9E0D4" : "#D8EAE6" }; setSites(current => [newSite, ...current]); updateLead({ ...lead, status: "Site em desenvolvimento", activities: [{ id: uid("activity"), label: "Briefing de site criado", date: "Agora" }, ...lead.activities] }); toast.success(`Briefing de ${lead.name} criado.`); navigate("/sites"); };
  const exportSite = (site: SiteRecord) => { const lead = leads.find(item => item.id === site.leadId); const payload = { project: site, source: lead, generatedAt: new Date().toISOString(), note: "Briefing exportado pelo Prospecta; publique somente após revisar o conteúdo." }; const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${site.leadName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-briefing.json`; anchor.click(); URL.revokeObjectURL(url); toast.success("Briefing exportado."); };
  const publishSite = (site: SiteRecord) => { setSites(current => current.map(item => item.id === site.id ? { ...item, status: "Pronto para publicar" } : item)); toast.info("O projeto está pronto para uma conexão de publicação. Nenhum site foi publicado automaticamente."); };
  const activeLocation = ["/", "/leads", "/crm", "/mensagens", "/sites", "/configuracoes"].includes(location) ? location : "/";
  const view = activeLocation === "/" ? <Dashboard leads={visibleLeads} onNavigate={navigate} onSelect={setSelectedLead} onMessage={handleMessage} onSite={handleSite} onDemo={loadDemo} /> : activeLocation === "/leads" ? <SearchView leads={visibleLeads} onAddLeads={addLeads} onSelect={setSelectedLead} onMessage={handleMessage} onSite={handleSite} onDemo={loadDemo} /> : activeLocation === "/crm" ? <LeadsView leads={visibleLeads} onSelect={setSelectedLead} onMessage={handleMessage} onSite={handleSite} onDemo={loadDemo} /> : activeLocation === "/mensagens" ? <MessagesView leads={visibleLeads} selectedLeadId={messageLeadId} onSelectLead={lead => setMessageLeadId(lead.id)} onUpdateLead={updateLead} /> : activeLocation === "/sites" ? <SitesView leads={visibleLeads} sites={sites} onGenerate={handleSite} onExport={exportSite} onPublish={publishSite} /> : <SettingsView />;
  return <main className="app-shell"><Sidebar location={activeLocation} collapsed={false} onNavigate={navigate} onClose={() => setMobileMenu(false)} /><div className={`sidebar-mobile-overlay ${mobileMenu ? "open" : ""}`} onClick={() => setMobileMenu(false)} /><div className="app-main"><Topbar location={activeLocation} onMenu={() => setMobileMenu(true)} onSearch={setGlobalSearch} /><div className="content-wrap">{view}</div></div>{selectedLead && <LeadDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} onUpdate={updateLead} onMessage={handleMessage} onSite={handleSite} />}{mobileMenu && <div className="mobile-sidebar-wrap"><Sidebar location={activeLocation} collapsed={false} onNavigate={navigate} onClose={() => setMobileMenu(false)} /></div>}</main>;
}
