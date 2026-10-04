"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "@/lib/auth";
import { getIndex } from "@/lib/indices";
import {
  addCollaborator,
  acceptInvite,
  canEditCustomIndex,
  customId,
  declineInvite,
  getCustomIndexForUser,
  removeCollaborator,
} from "@/lib/custom-indexes";
import { getSpotPrice, resolveWeighting } from "@/lib/yahoo";
import { buy, sell, TradeResult } from "@/lib/portfolio";
import { prisma } from "@/lib/prisma";

// ---- Auth (used with <form action={...}>) -----------------------------------

export type AuthState = { error?: string } | undefined;

export async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const email = String(formData.get("email") ?? "");
  const res = await registerUser(username, password, email);
  if (!res.ok) return { error: res.error };
  redirect("/portfolio");
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const res = await loginUser(username, password);
  if (!res.ok) return { error: res.error };
  redirect("/portfolio");
}

export async function logoutAction() {
  await logoutUser();
  redirect("/");
}

// ---- Trading (called from client components) --------------------------------

export async function buyIndex(
  slug: string,
  weightingRaw: string,
  amount: number,
): Promise<TradeResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in to paper trade." };
  const def = getIndex(slug) ?? await getCustomIndexForUser(user.id, slug);
  if (!def) return { ok: false, error: "Unknown index." };

  const weighting = resolveWeighting(weightingRaw);
  const spot = await getSpotPrice(def, weighting);
  if (spot == null) return { ok: false, error: "Live price unavailable, try again." };

  const res = await buy(user.id, slug, weighting, amount, spot);
  if (res.ok) {
    revalidatePath("/portfolio");
    revalidatePath(`/index/${slug}`);
  }
  return res;
}

export async function sellIndex(
  slug: string,
  weightingRaw: string,
  units: number,
): Promise<TradeResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in to paper trade." };
  const def = getIndex(slug) ?? await getCustomIndexForUser(user.id, slug);
  if (!def) return { ok: false, error: "Unknown index." };

  const weighting = resolveWeighting(weightingRaw);
  const spot = await getSpotPrice(def, weighting);
  if (spot == null) return { ok: false, error: "Live price unavailable, try again." };

  const res = await sell(user.id, slug, weighting, units, spot);
  if (res.ok) {
    revalidatePath("/portfolio");
    revalidatePath(`/index/${slug}`);
  }
  return res;
}

// ---- User-created indexes ---------------------------------------------------

type CustomIndexActionState = { error?: string; ok?: boolean } | undefined;

type ParsedCustomConstituent = { symbol: string; name: string; weight: number };
type ParsedSource = { title: string; outlet: string; date: string; url: string };

function parseSources(raw: string): { error: string } | { sources: ParsedSource[] } {
  const trimmed = raw.trim();
  if (!trimmed) return { sources: [] };
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { error: "Sources must be valid JSON." };
  }
  if (!Array.isArray(parsed) || parsed.length > 6)
    return { error: "Add up to 6 sources." };
  const sources = parsed.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      title: String(row.title ?? "").trim(),
      outlet: String(row.outlet ?? "").trim(),
      date: String(row.date ?? "").trim(),
      url: String(row.url ?? "").trim(),
    };
  });
  if (sources.some((s) => !s.title || !s.url))
    return { error: "Each source needs a title and a URL." };
  return { sources };
}

function parseConstituents(raw: string): { error: string } | { constituents: ParsedCustomConstituent[] } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Constituents must be valid JSON." };
  }
  if (!Array.isArray(parsed) || parsed.length < 2 || parsed.length > 40)
    return { error: "Add between 2 and 40 constituents." };
  const constituents = parsed.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      symbol: String(row.symbol ?? "").trim().toUpperCase(),
      name: String(row.name ?? "").trim(),
      weight: Number(row.weight),
    };
  });
  if (constituents.some((c) => !/^[A-Z0-9^.=:-]+$/.test(c.symbol) || !c.name || !Number.isFinite(c.weight) || c.weight <= 0))
    return { error: "Each row needs a valid symbol, name, and positive weight." };
  const symbols = new Set(constituents.map((c) => c.symbol));
  if (symbols.size !== constituents.length) return { error: "Symbols must be unique." };
  return { constituents };
}

async function customIndexInput(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (name.length < 3 || name.length > 80) return { error: "Name must be 3–80 characters." };
  if (tagline.length < 3 || tagline.length > 120) return { error: "Tagline must be 3–120 characters." };
  if (description.length < 10 || description.length > 500) return { error: "Description must be 10–500 characters." };
  const constituents = parseConstituents(String(formData.get("constituents") ?? ""));
  if ("error" in constituents) return constituents;
  const sources = parseSources(String(formData.get("sources") ?? ""));
  if ("error" in sources) return sources;
  return {
    name,
    tagline,
    description,
    constituents: constituents.constituents,
    sources: sources.sources,
  } as const;
}

export async function createCustomIndex(formData: FormData): Promise<CustomIndexActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Log in to create a custom index." };
  const input = await customIndexInput(formData);
  if ("error" in input) return input;
  const now = BigInt(Date.now());
  const row = await prisma.customIndex.create({
    data: {
      userId: user.id,
      slug: `pending-${crypto.randomUUID()}`,
      name: input.name,
      tagline: input.tagline,
      description: input.description,
      sources: input.sources,
      createdAt: now,
      updatedAt: now,
      constituents: { create: input.constituents },
    },
  });
  await prisma.customIndex.update({
    where: { id: row.id },
    data: { slug: `custom-${row.id}` },
  });
  revalidatePath("/custom");
  redirect("/custom");
}

export async function updateCustomIndex(formData: FormData): Promise<CustomIndexActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Log in to edit a custom index." };
  const id = String(formData.get("id") ?? "");
  const custom = await getCustomIndexForUser(user.id, id);
  if (!custom) return { error: "Custom index not found." };
  const input = await customIndexInput(formData);
  if ("error" in input) return input;
  const customIdValue = BigInt(id.slice("custom-".length));
  await prisma.customIndex.update({
    where: { id: customIdValue },
    data: {
      name: input.name,
      tagline: input.tagline,
      description: input.description,
      sources: input.sources,
      updatedAt: BigInt(Date.now()),
      constituents: {
        deleteMany: {},
        create: input.constituents,
      },
    },
  });
  revalidatePath("/custom");
  revalidatePath("/compare");
  redirect("/custom");
}

export async function deleteCustomIndex(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const raw = String(formData.get("id") ?? "");
  const id = raw.startsWith("custom-") && /^\d+$/.test(raw.slice(7)) ? BigInt(raw.slice(7)) : null;
  if (id == null) return;
  if (!(await canEditCustomIndex(user.id, id))) return;
  await prisma.customIndex.delete({ where: { id } });
  revalidatePath("/custom");
  revalidatePath("/compare");
}

// ---- Co-owners --------------------------------------------------------------

export async function inviteCollaboratorAction(
  formData: FormData,
): Promise<CustomIndexActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Log in to invite." };
  const id = customId(String(formData.get("id") ?? ""));
  const username = String(formData.get("username") ?? "").trim();
  if (id == null) return { error: "Unknown index." };
  if (!username) return { error: "Enter a username to invite." };
  if (!(await canEditCustomIndex(user.id, id)))
    return { error: "You don't have edit access to this index." };
  const res = await addCollaborator(id, username, user.id);
  if (!res.ok) return { error: res.error };
  revalidatePath("/custom");
  return { ok: true };
}

export async function removeCollaboratorAction(
  formData: FormData,
): Promise<CustomIndexActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Log in to manage co-owners." };
  const id = customId(String(formData.get("id") ?? ""));
  const username = String(formData.get("username") ?? "").trim();
  if (id == null) return { error: "Unknown index." };
  const custom = await prisma.customIndex.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!custom) return { error: "Unknown index." };
  if (!(await canEditCustomIndex(user.id, id)))
    return { error: "You don't have edit access to this index." };
  const res = await removeCollaborator(id, username, user.id, custom.userId === user.id);
  if (!res.ok) return { error: res.error };
  revalidatePath("/custom");
  return { ok: true };
}

export async function acceptInviteAction(formData: FormData): Promise<CustomIndexActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Log in to accept invites." };
  const rawId = String(formData.get("inviteId") ?? "");
  if (!/^\d+$/.test(rawId)) return { error: "Invalid invite." };
  const id = BigInt(rawId);
  const result = await acceptInvite(user.id, id);
  if (!result.ok) return { error: result.error };
  revalidatePath("/inbox");
  revalidatePath("/custom");
  revalidatePath("/compare");
  return { ok: true };
}

export async function declineInviteAction(formData: FormData): Promise<CustomIndexActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Log in to decline invites." };
  const rawId = String(formData.get("inviteId") ?? "");
  if (!/^\d+$/.test(rawId)) return { error: "Invalid invite." };
  const id = BigInt(rawId);
  const result = await declineInvite(user.id, id);
  if (!result.ok) return { error: result.error };
  revalidatePath("/inbox");
  return { ok: true };
}

// ---- Profile ----------------------------------------------------------------

export type ProfileState = { error?: string; ok?: boolean } | undefined;

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Log in to edit your profile." };

  const bio = String(formData.get("bio") ?? "").trim().slice(0, 160);
  const about = String(formData.get("about") ?? "").trim().slice(0, 1000);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email address." };
  if (email) {
    const taken = await prisma.user.findFirst({ where: { email, NOT: { id: user.id } }, select: { id: true } });
    if (taken) return { error: "That email is already registered." };
  }

  let links: { label: string; url: string }[] = [];
  const rawLinks = String(formData.get("links") ?? "").trim();
  if (rawLinks) {
    try {
      const parsed = JSON.parse(rawLinks);
      if (!Array.isArray(parsed) || parsed.length > 4)
        return { error: "Add up to 4 links." };
      links = parsed
        .map((item) => {
          const row = item as Record<string, unknown>;
          return {
            label: String(row.label ?? "").trim().slice(0, 40),
            url: String(row.url ?? "").trim().slice(0, 300),
          };
        })
        .filter((link) => link.label && link.url);
    } catch {
      return { error: "Links must be valid JSON." };
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      bio: bio || null,
      about: about || null,
      email: email || null,
      links: links.length ? links : undefined,
    },
  });
  revalidatePath(`/user/${user.username}`);
  return { ok: true };
}

export async function deleteAccountAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (String(formData.get("confirmation") ?? "") !== "DELETE") return;
  await prisma.user.delete({ where: { id: user.id } });
  await logoutUser();
  redirect("/");
}
