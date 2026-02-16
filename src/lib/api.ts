import { supabase } from "@/lib/supabase";

export type QuoteItem = {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  unit?: string | null;
  quantity: number;
  unitPrice: number;
  slaTier?: string | null;
  kpiTags?: string[];
};

export type Quote = {
  id: string;
  dbId?: string;
  name: string;
  customer: string;
  contactName?: string | null;
  contactEmail?: string | null;
  region?: string | null;
  owner?: string | null;
  status: string;
  createdAt?: string | null;
  expiresAt?: string | null;
  sentAt?: string | null;
  viewedAt?: string | null;
  acceptedAt?: string | null;
  assumptions?: string[];
  terms?: string[];
  subtotal?: number;
  total?: number;
  currency?: string | null;
  items: QuoteItem[];
};

export type Contract = {
  id: string;
  quoteId: string;
  customer: string;
  status: string;
  owner?: string | null;
  startDate?: string | null;
  renewalDate?: string | null;
  slaTier?: string | null;
  serviceLevels?: string[];
  kpis?: { label: string; target: string; measurement?: string }[];
  supportModel?: string | null;
  escalation?: { level: string; response: string; owner: string }[];
  billingCycle?: string | null;
  billingCurrency?: string | null;
  mrr?: number | null;
  arr?: number | null;
  paymentTerms?: string | null;
  invoicingDay?: number | null;
  healthScore?: number | null;
  riskLevel?: string | null;
  lastQbr?: string | null;
  nextQbr?: string | null;
  autoRenew?: boolean | null;
  contacts?: { name?: string; email?: string; role?: string }[];
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type Profile = {
  id: string;
  authUserId?: string | null;
  email: string;
  name?: string | null;
  role?: string | null;
  company?: string | null;
  phone?: string | null;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type Ticket = {
  id: string;
  dbId?: string;
  customer: string;
  requesterName?: string | null;
  requesterEmail?: string | null;
  subject: string;
  category?: string | null;
  priority?: string | null;
  status?: string | null;
  assignedTo?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  slaDueAt?: string | null;
  notes?: Array<{ body: string; createdAt: string; author?: string }>;
  tags?: string[];
};

export type Subscription = {
  id: string;
  dbId?: string;
  customer: string;
  plan?: string | null;
  status?: string | null;
  startDate?: string | null;
  renewalDate?: string | null;
  billingCycle?: string | null;
  billingCurrency?: string | null;
  mrr?: number | null;
  seats?: number | null;
  addOns?: Array<{ name: string; price?: string; active?: boolean }>;
  owner?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type Invoice = {
  id: string;
  dbId?: string;
  subscriptionId?: string | null;
  status?: string | null;
  amount?: number | null;
  currency?: string | null;
  dueDate?: string | null;
  paidAt?: string | null;
  createdAt?: string | null;
};

export type ReportSummary = {
  kpis: Array<{ label: string; value: number; change?: string | null; format?: string }>;
  topIssues: Array<{ category: string; count: number; pct: string }>;
};

export type AdminDashboardSummary = {
  stats: {
    totalClients: number;
    openTickets: number;
    activeSubs: number;
    mrr: number;
    uptime: number;
  };
  activity: Array<{ id: string; action: string; detail?: string | null; actor?: string | null; createdAt: string }>;
};

export type PortalSummary = {
  profile: Profile | null;
  subscription: Subscription | null;
  tickets: Ticket[];
};

export type PortalSubscriptionSummary = {
  profile: Profile | null;
  subscription: Subscription | null;
  invoices: Invoice[];
};

const handleError = (error: unknown) => {
  if (error && typeof error === "object" && "message" in error) {
    throw new Error(String((error as { message?: string }).message));
  }
  throw new Error("Request failed");
};

const generatePublicId = (prefix: string) => {
  const year = new Date().getFullYear();
  const token = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${token}`;
};

const mapQuoteItem = (item: any): QuoteItem => ({
  id: item.id,
  name: item.name,
  category: item.category,
  description: item.description,
  unit: item.unit,
  quantity: Number(item.quantity),
  unitPrice: Number(item.unit_price),
  slaTier: item.sla_tier,
  kpiTags: item.kpi_tags ?? [],
});

const normalizeQuote = (row: any, items: QuoteItem[]): Quote => ({
  id: row.public_id,
  dbId: row.id,
  name: row.name,
  customer: row.customer,
  contactName: row.contact_name,
  contactEmail: row.contact_email,
  region: row.region,
  owner: row.owner,
  status: row.status,
  createdAt: row.created_at,
  expiresAt: row.expires_at,
  sentAt: row.sent_at,
  viewedAt: row.viewed_at,
  acceptedAt: row.accepted_at,
  assumptions: row.assumptions ?? [],
  terms: row.terms ?? [],
  subtotal: Number(row.subtotal || 0),
  total: Number(row.total || 0),
  currency: row.currency ?? "ZAR",
  items,
});

const normalizeContract = (row: any, quotePublicId?: string | null): Contract => ({
  id: row.public_id,
  quoteId: quotePublicId ?? row.quote_public_id ?? row.quote_id,
  customer: row.customer,
  status: row.status,
  owner: row.owner,
  startDate: row.start_date,
  renewalDate: row.renewal_date,
  slaTier: row.sla_tier,
  serviceLevels: row.service_levels ?? [],
  kpis: row.kpis ?? [],
  supportModel: row.support_model,
  escalation: row.escalation ?? [],
  billingCycle: row.billing_cycle,
  billingCurrency: row.billing_currency,
  mrr: Number(row.mrr || 0),
  arr: Number(row.arr || 0),
  paymentTerms: row.payment_terms,
  invoicingDay: row.invoicing_day,
  healthScore: row.health_score,
  riskLevel: row.risk_level,
  lastQbr: row.last_qbr,
  nextQbr: row.next_qbr,
  autoRenew: row.auto_renew,
  contacts: row.contacts ?? [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const normalizeProfile = (row: any): Profile => ({
  id: row.id,
  authUserId: row.auth_user_id,
  email: row.email,
  name: row.name,
  role: row.role,
  company: row.company,
  phone: row.phone,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const normalizeTicket = (row: any): Ticket => ({
  id: row.public_id ?? row.id,
  dbId: row.id,
  customer: row.customer,
  requesterName: row.requester_name,
  requesterEmail: row.requester_email,
  subject: row.subject,
  category: row.category,
  priority: row.priority,
  status: row.status,
  assignedTo: row.assigned_to,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  slaDueAt: row.sla_due_at,
  notes: row.notes ?? [],
  tags: row.tags ?? [],
});

const normalizeSubscription = (row: any): Subscription => ({
  id: row.public_id ?? row.id,
  dbId: row.id,
  customer: row.customer,
  plan: row.plan,
  status: row.status,
  startDate: row.start_date,
  renewalDate: row.renewal_date,
  billingCycle: row.billing_cycle,
  billingCurrency: row.billing_currency,
  mrr: Number(row.mrr || 0),
  seats: row.seats,
  addOns: row.add_ons ?? [],
  owner: row.owner,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const normalizeInvoice = (row: any, subscriptionPublicId?: string | null): Invoice => ({
  id: row.invoice_number ?? row.id,
  dbId: row.id,
  subscriptionId: subscriptionPublicId ?? row.subscription_public_id,
  status: row.status,
  amount: Number(row.amount || 0),
  currency: row.currency,
  dueDate: row.due_date,
  paidAt: row.paid_at,
  createdAt: row.created_at,
});

export const fetchQuotes = async (): Promise<Quote[]> => {
  const { data: quotes, error } = await supabase.from("quotes").select("*").order("created_at", { ascending: false });
  if (error) handleError(error);
  const ids = (quotes ?? []).map((row) => row.id);
  const itemsByQuote: Record<string, QuoteItem[]> = {};
  if (ids.length) {
    const { data: items, error: itemsError } = await supabase
      .from("quote_items")
      .select("*")
      .in("quote_id", ids);
    if (itemsError) handleError(itemsError);
    (items ?? []).forEach((item) => {
      const list = itemsByQuote[item.quote_id] ?? [];
      list.push(mapQuoteItem(item));
      itemsByQuote[item.quote_id] = list;
    });
  }
  return (quotes ?? []).map((row) => normalizeQuote(row, itemsByQuote[row.id] ?? []));
};

export const fetchQuote = async (id: string): Promise<Quote> => {
  const { data: quote, error } = await supabase.from("quotes").select("*").eq("public_id", id).single();
  if (error) handleError(error);
  const { data: items, error: itemsError } = await supabase.from("quote_items").select("*").eq("quote_id", quote.id);
  if (itemsError) handleError(itemsError);
  return normalizeQuote(quote, (items ?? []).map(mapQuoteItem));
};

export const createQuote = async (payload: {
  publicId?: string;
  name: string;
  customer: string;
  contactName?: string;
  contactEmail?: string;
  region?: string;
  owner?: string;
  status?: string;
  expiresAt?: string;
  currency?: string;
  assumptions?: string[];
  terms?: string[];
  items?: Array<{
    name: string;
    category: string;
    description?: string;
    unit?: string;
    quantity: number;
    unitPrice: number;
    slaTier?: string;
    kpiTags?: string[];
  }>;
}) => {
  const totals = (payload.items ?? []).reduce(
    (acc, item) => {
      const subtotal = acc.subtotal + Number(item.quantity || 0) * Number(item.unitPrice || 0);
      return { subtotal, total: subtotal };
    },
    { subtotal: 0, total: 0 },
  );

  const { data: quote, error } = await supabase
    .from("quotes")
    .insert({
      public_id: payload.publicId ?? generatePublicId("Q"),
      name: payload.name,
      customer: payload.customer,
      contact_name: payload.contactName ?? null,
      contact_email: payload.contactEmail ?? null,
      region: payload.region ?? null,
      owner: payload.owner ?? null,
      status: payload.status ?? "Draft",
      expires_at: payload.expiresAt ?? null,
      currency: payload.currency ?? "ZAR",
      assumptions: payload.assumptions ?? [],
      terms: payload.terms ?? [],
      subtotal: totals.subtotal,
      total: totals.total,
    })
    .select("*")
    .single();
  if (error) handleError(error);

  if (payload.items?.length) {
    const items = payload.items.map((item) => ({
      quote_id: quote.id,
      name: item.name,
      category: item.category,
      description: item.description ?? null,
      unit: item.unit ?? null,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      sla_tier: item.slaTier ?? null,
      kpi_tags: item.kpiTags ?? [],
    }));
    const { error: itemError } = await supabase.from("quote_items").insert(items);
    if (itemError) handleError(itemError);
  }

  return { id: quote.public_id };
};

export const sendQuote = async (id: string) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) {
    throw new Error("You must be signed in to send quotes.");
  }
  const { data, error } = await supabase.functions.invoke("send-quote", {
    body: { quoteId: id },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (error) handleError(error);
  return data ?? { ok: true };
};

export const acceptQuote = async (id: string, payload: Record<string, unknown>) => {
  const { data: quote, error: quoteError } = await supabase.from("quotes").select("*").eq("public_id", id).single();
  if (quoteError) handleError(quoteError);

  const contractPayload = {
    public_id: generatePublicId("CTR"),
    quote_id: quote.id,
    customer: quote.customer,
    status: (payload.status as string) ?? "Pending",
    owner: (payload.owner as string) ?? quote.owner ?? null,
    start_date: payload.startDate ?? null,
    renewal_date: payload.renewalDate ?? null,
    sla_tier: payload.slaTier ?? null,
    service_levels: payload.serviceLevels ?? [],
    kpis: payload.kpis ?? [],
    support_model: payload.supportModel ?? null,
    escalation: payload.escalation ?? [],
    billing_cycle: payload.billingCycle ?? null,
    billing_currency: payload.billingCurrency ?? "USD",
    mrr: Number(payload.mrr || 0),
    arr: Number(payload.arr || 0),
    payment_terms: payload.paymentTerms ?? null,
    invoicing_day: payload.invoicingDay ?? null,
    health_score: payload.healthScore ?? null,
    risk_level: payload.riskLevel ?? null,
    last_qbr: payload.lastQbr ?? null,
    next_qbr: payload.nextQbr ?? null,
    auto_renew: payload.autoRenew ?? true,
    contacts: payload.contacts ?? [],
  };

  const { data: contract, error: contractError } = await supabase
    .from("contracts")
    .upsert(contractPayload, { onConflict: "quote_id" })
    .select("*")
    .single();
  if (contractError) handleError(contractError);

  const { error: updateError } = await supabase
    .from("quotes")
    .update({ status: "Accepted", accepted_at: new Date().toISOString() })
    .eq("id", quote.id);
  if (updateError) handleError(updateError);

  return { id: contract.public_id };
};

export const fetchContracts = async (): Promise<Contract[]> => {
  const { data: contracts, error } = await supabase.from("contracts").select("*").order("created_at", { ascending: false });
  if (error) handleError(error);
  const quoteIds = (contracts ?? []).map((row) => row.quote_id);
  const quoteMap: Record<string, string> = {};
  if (quoteIds.length) {
    const { data: quotes, error: quoteError } = await supabase
      .from("quotes")
      .select("id, public_id")
      .in("id", quoteIds);
    if (quoteError) handleError(quoteError);
    (quotes ?? []).forEach((row) => {
      quoteMap[row.id] = row.public_id;
    });
  }
  return (contracts ?? []).map((row) => normalizeContract(row, quoteMap[row.quote_id]));
};

export const fetchContract = async (id: string): Promise<Contract> => {
  const { data: contract, error } = await supabase.from("contracts").select("*").eq("public_id", id).single();
  if (error) handleError(error);
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("public_id")
    .eq("id", contract.quote_id)
    .single();
  if (quoteError) handleError(quoteError);
  return normalizeContract(contract, quote.public_id);
};

export const fetchUsers = async (): Promise<Profile[]> => {
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) handleError(error);
  return (data ?? []).map(normalizeProfile);
};

export const fetchUserByEmail = async (email: string): Promise<Profile | null> => {
  const { data, error } = await supabase.from("profiles").select("*").eq("email", email).maybeSingle();
  if (error) handleError(error);
  return data ? normalizeProfile(data) : null;
};

export const updateProfile = async (id: string, payload: Partial<Pick<Profile, "name" | "company" | "phone" | "status">>) => {
  const { data, error } = await supabase.from("profiles").update(payload).eq("id", id).select("*").single();
  if (error) handleError(error);
  return normalizeProfile(data);
};

export const fetchTickets = async (params?: { status?: string; requesterEmail?: string; customer?: string }) => {
  let query = supabase.from("tickets").select("*").order("created_at", { ascending: false });
  if (params?.status) query = query.eq("status", params.status);
  if (params?.requesterEmail) query = query.eq("requester_email", params.requesterEmail);
  if (params?.customer) query = query.eq("customer", params.customer);
  const { data, error } = await query;
  if (error) handleError(error);
  return (data ?? []).map(normalizeTicket) as Ticket[];
};

export const createTicket = async (payload: {
  customer: string;
  requesterName?: string;
  requesterEmail?: string;
  subject: string;
  category?: string;
  priority?: string;
  description?: string;
}) => {
  const notes = payload.description
    ? [{ body: payload.description, createdAt: new Date().toISOString(), author: payload.requesterName ?? payload.requesterEmail }]
    : [];
  const { data, error } = await supabase
    .from("tickets")
    .insert({
      public_id: generatePublicId("TKT"),
      customer: payload.customer,
      requester_name: payload.requesterName ?? null,
      requester_email: payload.requesterEmail ?? null,
      subject: payload.subject,
      category: payload.category ?? null,
      priority: payload.priority ?? "Medium",
      notes,
    })
    .select("*")
    .single();
  if (error) handleError(error);
  return normalizeTicket(data);
};

export const fetchSubscriptions = async (params?: { customer?: string }) => {
  let query = supabase.from("subscriptions").select("*").order("created_at", { ascending: false });
  if (params?.customer) query = query.eq("customer", params.customer);
  const { data, error } = await query;
  if (error) handleError(error);
  return (data ?? []).map(normalizeSubscription) as Subscription[];
};

export const fetchInvoices = async (params?: { subscriptionId?: string; customer?: string }) => {
  if (params?.subscriptionId) {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("subscription_id", params.subscriptionId)
      .order("created_at", { ascending: false });
    if (error) handleError(error);
    return (data ?? []).map((row) => normalizeInvoice(row, params.subscriptionId)) as Invoice[];
  }

  if (params?.customer) {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("id, public_id")
      .eq("customer", params.customer)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!subscription) return [];
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("subscription_id", subscription.id)
      .order("created_at", { ascending: false });
    if (error) handleError(error);
    return (data ?? []).map((row) => normalizeInvoice(row, subscription.public_id)) as Invoice[];
  }

  const { data, error } = await supabase.from("invoices").select("*").order("created_at", { ascending: false });
  if (error) handleError(error);
  return (data ?? []).map(normalizeInvoice) as Invoice[];
};

export const fetchReportSummary = async (): Promise<ReportSummary> => {
  const [{ data: subscriptions }, { data: tickets }, { data: profiles }] = await Promise.all([
    supabase.from("subscriptions").select("status, mrr"),
    supabase.from("tickets").select("status, category"),
    supabase.from("profiles").select("created_at"),
  ]);

  const totalMrr = (subscriptions ?? []).reduce((sum, row) => sum + Number(row.mrr || 0), 0);
  const totalSubs = subscriptions?.length || 1;
  const canceled = (subscriptions ?? []).filter((row) => row.status === "Cancelled").length;
  const ticketsTotal = tickets?.length || 1;
  const resolved = (tickets ?? []).filter((row) => row.status === "Resolved").length;
  const last30 = new Date();
  last30.setDate(last30.getDate() - 30);
  const newClients = (profiles ?? []).filter((row) => new Date(row.created_at) >= last30).length;

  const categoryCounts = (tickets ?? []).reduce((acc: Record<string, number>, row: any) => {
    const key = row.category ?? "General";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const topIssues = Object.entries(categoryCounts)
    .map(([category, count]) => ({
      category,
      count,
      pct: `${Math.round((count / ticketsTotal) * 100)}%`,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    kpis: [
      { label: "Monthly Revenue", value: totalMrr, change: null, format: "currency" },
      { label: "Resolution Rate", value: Math.round((resolved / ticketsTotal) * 100), change: null, format: "percent" },
      { label: "New Clients (Month)", value: newClients, change: null, format: "number" },
      { label: "Churn Rate", value: Math.round((canceled / totalSubs) * 100), change: null, format: "percent" },
    ],
    topIssues,
  };
};

export const fetchAdminDashboard = async (): Promise<AdminDashboardSummary> => {
  const [{ data: profiles }, { data: tickets }, { data: subscriptions }, { data: activity }] = await Promise.all([
    supabase.from("profiles").select("id"),
    supabase.from("tickets").select("status"),
    supabase.from("subscriptions").select("status, mrr"),
    supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(8),
  ]);

  const openTickets = (tickets ?? []).filter((row) => row.status !== "Resolved").length;
  const activeSubs = (subscriptions ?? []).filter((row) => row.status === "Active").length;
  const mrr = (subscriptions ?? []).reduce((sum, row) => sum + Number(row.mrr || 0), 0);

  return {
    stats: {
      totalClients: profiles?.length ?? 0,
      openTickets,
      activeSubs,
      mrr,
      uptime: 99.97,
    },
    activity: (activity ?? []).map((row: any) => ({
      id: row.id,
      action: row.action,
      detail: row.detail,
      actor: row.actor,
      createdAt: row.created_at,
    })),
  };
};

export const fetchPortalSummary = async (email: string): Promise<PortalSummary> => {
  const { data: profile } = await supabase.from("profiles").select("*").eq("email", email).maybeSingle();
  if (!profile) return { profile: null, subscription: null, tickets: [] };
  const customer = profile.company ?? profile.name ?? profile.email;
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("customer", customer)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { data: tickets } = await supabase
    .from("tickets")
    .select("*")
    .eq("requester_email", profile.email)
    .order("created_at", { ascending: false })
    .limit(5);
  return {
    profile: normalizeProfile(profile),
    subscription: subscription ? normalizeSubscription(subscription) : null,
    tickets: (tickets ?? []).map(normalizeTicket),
  };
};

export const fetchPortalSubscription = async (email: string): Promise<PortalSubscriptionSummary> => {
  const { data: profile } = await supabase.from("profiles").select("*").eq("email", email).maybeSingle();
  if (!profile) return { profile: null, subscription: null, invoices: [] };
  const customer = profile.company ?? profile.name ?? profile.email;
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("customer", customer)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!subscription) return { profile: normalizeProfile(profile), subscription: null, invoices: [] };
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("subscription_id", subscription.id)
    .order("created_at", { ascending: false });
  return {
    profile: normalizeProfile(profile),
    subscription: normalizeSubscription(subscription),
    invoices: (invoices ?? []).map((row) => normalizeInvoice(row, subscription.public_id)),
  };
};

export const downloadQuotePdf = async (id: string) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) {
    throw new Error("You must be signed in to download PDFs.");
  }
  const { data, error } = await supabase.functions.invoke("quote-pdf", {
    body: { quoteId: id },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (error) handleError(error);
  const base64 = data?.base64 as string | undefined;
  if (!base64) throw new Error("No PDF payload returned.");
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i += 1) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const blob = new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = data?.filename ?? `Continuate-Quote-${id}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const createTestData = async (params: {
  customer: string;
  requesterEmail: string;
  requesterName?: string;
  owner?: string;
}) => {
  const quoteId = generatePublicId("Q");
  const ticketId = generatePublicId("TKT");
  const subscriptionId = generatePublicId("SUB");

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .insert({
      public_id: quoteId,
      name: "Starter Managed IT Services",
      customer: params.customer,
      contact_name: params.requesterName ?? params.customer,
      contact_email: params.requesterEmail,
      region: "ZA",
      owner: params.owner ?? "Continuate Admin",
      status: "Draft",
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
      assumptions: ["Access to endpoint inventory within 10 business days."],
      terms: ["12-month term with annual renewal."],
      subtotal: 4500,
      total: 4500,
    })
    .select("*")
    .single();
  if (quoteError) handleError(quoteError);

  const { error: itemsError } = await supabase.from("quote_items").insert([
    {
      quote_id: quote.id,
      name: "Managed Service Desk",
      category: "IT SLA",
      description: "24/7 support desk coverage",
      unit: "per user",
      quantity: 25,
      unit_price: 180,
      sla_tier: "Gold 1-hr response",
      kpi_tags: ["First response < 60m"],
    },
  ]);
  if (itemsError) handleError(itemsError);

  const { error: ticketError } = await supabase.from("tickets").insert({
    public_id: ticketId,
    customer: params.customer,
    requester_name: params.requesterName ?? params.customer,
    requester_email: params.requesterEmail,
    subject: "Initial onboarding request",
    category: "General",
    priority: "Medium",
    status: "Open",
  });
  if (ticketError) handleError(ticketError);

  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .insert({
      public_id: subscriptionId,
      customer: params.customer,
      plan: "Professional",
      status: "Active",
      start_date: new Date().toISOString().slice(0, 10),
      renewal_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString().slice(0, 10),
      billing_cycle: "Monthly",
      billing_currency: "ZAR",
      mrr: 4500,
      seats: 25,
      add_ons: [{ name: "CCTV Monitoring", price: "R800/mo", active: true }],
      owner: params.owner ?? "Continuate Admin",
    })
    .select("*")
    .single();
  if (subscriptionError) handleError(subscriptionError);

  const { error: invoiceError } = await supabase.from("invoices").insert({
    subscription_id: subscription.id,
    invoice_number: `INV-${new Date().getFullYear()}-0001`,
    status: "Paid",
    amount: 4500,
    currency: "ZAR",
    due_date: new Date().toISOString().slice(0, 10),
    paid_at: new Date().toISOString().slice(0, 10),
  });
  if (invoiceError) handleError(invoiceError);

  const { error: reportError } = await supabase.from("reports").insert({
    title: "Monthly Service Summary",
    period_start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
    period_end: new Date().toISOString().slice(0, 10),
    summary: "Initial service baseline.",
    kpis: [{ label: "Monthly Revenue", value: 4500 }],
    issues: [{ category: "General", count: 1, pct: "100%" }],
  });
  if (reportError) handleError(reportError);

  const { error: activityError } = await supabase.from("activity_log").insert({
    action: "Seeded data",
    detail: "Initial demo data created.",
    actor: params.owner ?? params.requesterEmail,
  });
  if (activityError) handleError(activityError);

  return { quoteId, ticketId, subscriptionId };
};
