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
    <div className="w-full max-w-sm rounded-2xl border border-surface bg-surface/40 p-6">
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-full border border-surface bg-background p-1 text-sm">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-full py-1.5 font-semibold transition ${
              mode === m ? "bg-accent text-white" : "text-muted hover:text-foreground"
            }`}
          >
            {m === "login" ? "Log in" : "Sign up"}
          </button>
        ))}
      </div>

      <form action={action} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-muted">Username</label>
          <input
            name="username"
            autoComplete="username"
            required
            className="w-full rounded-lg border border-surface bg-background px-3 py-2 text-foreground outline-none focus:border-accent"
            placeholder="e.g. rakesh_jj"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Password</label>
          <input
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            minLength={6}
            className="w-full rounded-lg border border-surface bg-background px-3 py-2 text-foreground outline-none focus:border-accent"
            placeholder="at least 6 characters"
          />
        </div>

        {error && <p className="text-sm text-down">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-accent px-4 py-2.5 font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50"
        >
          {pending
            ? "\u2026"
            : isLogin
              ? "Log in"
              : "Create account \u00B7 get \u20B910,00,000"}
        </button>
      </form>

      <p className="mt-4 text-center text-[11px] text-muted-light">
        Accounts are for paper trading only. Don&apos;t reuse a real password.
        This is a demo app.
      </p>
    </div>
  );
}
