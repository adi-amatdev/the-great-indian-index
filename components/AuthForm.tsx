"use client";

import { useActionState, useState } from "react";
import { loginAction, registerAction, type AuthState } from "@/app/actions";

export default function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loginState, loginFn, loginPending] = useActionState<AuthState, FormData>(
    loginAction,
    undefined,
  );
  const [regState, regFn, regPending] = useActionState<AuthState, FormData>(
    registerAction,
    undefined,
  );

  const isLogin = mode === "login";
  const action = isLogin ? loginFn : regFn;
  const pending = isLogin ? loginPending : regPending;
  const error = (isLogin ? loginState : regState)?.error;

  return (
    <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-full border border-white/10 bg-black/30 p-1 text-sm">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-full py-1.5 font-semibold transition ${
              mode === m ? "bg-white text-black" : "text-white/60 hover:text-white"
            }`}
          >
            {m === "login" ? "Log in" : "Sign up"}
          </button>
        ))}
      </div>

      <form action={action} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-white/50">Username</label>
          <input
            name="username"
            autoComplete="username"
            required
            className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 outline-none focus:border-white/40"
            placeholder="e.g. rakesh_jj"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/50">Password</label>
          <input
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            minLength={6}
            className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 outline-none focus:border-white/40"
            placeholder="at least 6 characters"
          />
        </div>

        {error && <p className="text-sm text-red-300">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-white px-4 py-2.5 font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
        >
          {pending
            ? "…"
            : isLogin
              ? "Log in"
              : "Create account · get ₹10,00,000"}
        </button>
      </form>

      <p className="mt-4 text-center text-[11px] text-white/40">
        Accounts are for paper trading only. Don&apos;t reuse a real password —
        this is a demo app.
      </p>
    </div>
  );
}
