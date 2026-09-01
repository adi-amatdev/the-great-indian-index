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
import { getSpotPrice, resolveWeighting } from "@/lib/yahoo";
import { buy, sell, TradeResult } from "@/lib/portfolio";

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
  const def = getIndex(slug);
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
  const def = getIndex(slug);
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
