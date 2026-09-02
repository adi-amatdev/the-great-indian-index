import "server-only";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { STARTING_CASH } from "./db";

const COOKIE = "bharat_sid";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const PBKDF2_ITERS = 100_000;

// ---- Password hashing (Web Crypto PBKDF2) -----------------------------------

function toHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++)
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function derive(password: string, salt: Uint8Array): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password) as BufferSource,
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERS,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );
  return toHex(bits);
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `${toHex(salt)}:${await derive(password, salt)}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const candidate = await derive(password, fromHex(saltHex));
  if (candidate.length !== hashHex.length) return false;
  let diff = 0;
  for (let i = 0; i < candidate.length; i++)
    diff |= candidate.charCodeAt(i) ^ hashHex.charCodeAt(i);
  return diff === 0;
}

// ---- Sessions ---------------------------------------------------------------

async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

async function createSession(userId: bigint): Promise<string> {
  const token = toHex(crypto.getRandomValues(new Uint8Array(32)));
  await prisma.session.create({
    data: { token, userId, createdAt: BigInt(Date.now()) },
  });
  return token;
}

export async function getCurrentUser() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  return session?.user ?? null;
}

// ---- Register / login / logout ---------------------------------------------

export type AuthResult = { ok: true } | { ok: false; error: string };

export async function registerUser(
  username: string,
  password: string,
): Promise<AuthResult> {
  username = username.trim().toLowerCase();
  if (username.length < 3)
    return { ok: false, error: "Username must be at least 3 characters." };
  if (!/^[a-z0-9_]+$/.test(username))
    return { ok: false, error: "Use only letters, numbers and underscores." };
  if (password.length < 6)
    return { ok: false, error: "Password must be at least 6 characters." };

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return { ok: false, error: "That username is taken." };

  const user = await prisma.user.create({
    data: {
      username,
      passHash: await hashPassword(password),
      cash: STARTING_CASH,
      createdAt: BigInt(Date.now()),
    },
  });

  await setSessionCookie(await createSession(user.id));
  return { ok: true };
}

export async function loginUser(
  username: string,
  password: string,
): Promise<AuthResult> {
  username = username.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await verifyPassword(password, user.passHash)))
    return { ok: false, error: "Invalid username or password." };

  await setSessionCookie(await createSession(user.id));
  return { ok: true };
}

export async function logoutUser() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { token } });
  jar.delete(COOKIE);
}
