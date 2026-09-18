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
import { getCustomIndexForUser } from "@/lib/custom-indexes";
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
  const res = await registerUser(username, password);
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
  return { name, tagline, description, constituents: constituents.constituents } as const;
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
  await prisma.customIndex.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/custom");
  revalidatePath("/compare");
}
