"use client";

import { useActionState, useState } from "react";
import { loginAction, registerAction, type AuthState } from "@/app/actions";
import Segmented from "./ui/Segmented";
import Panel from "./ui/Panel";

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
    <Panel label="Account access" context="paper trading only" bodyClassName="p-5 sm:p-6">
      <Segmented<"login" | "register">
        label="Auth mode"
        value={mode}
        onChange={setMode}
        className="mb-5 w-full"
        options={[
          { value: "login", label: "Log in" },
          { value: "register", label: "Sign up · get ₹10,00,000" },
        ]}
      />

      <form action={action} className="space-y-4">
        <div>
          {!isLogin && (
            <div className="mb-4">
              <label htmlFor="email" className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-wider text-muted">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="w-full rounded-xl border border-surface bg-background px-3.5 py-2.5 text-foreground outline-none transition placeholder:text-muted-light focus:border-accent" />
            </div>
          )}
          <label
            htmlFor="username"
            className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-wider text-muted"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            required
            placeholder="e.g. rakesh_jj"
            className="w-full rounded-xl border border-surface bg-background px-3.5 py-2.5 text-foreground outline-none transition placeholder:text-muted-light focus:border-accent"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-wider text-muted"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            minLength={6}
            placeholder={isLogin ? "your password" : "at least 6 characters"}
            className="w-full rounded-xl border border-surface bg-background px-3.5 py-2.5 text-foreground outline-none transition placeholder:text-muted-light focus:border-accent"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-down-bg px-3.5 py-2.5 text-sm font-semibold text-down"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {pending
            ? "Working…"
            : isLogin
              ? "Log in"
              : "Create account · get ₹10,00,000"}
        </button>
      </form>

      <p className="mt-5 border-t border-surface pt-4 text-center text-[11px] leading-relaxed text-muted-light">
        Accounts are for paper trading only. Don&apos;t reuse a real password.
        This is a demo app.
      </p>
    </Panel>
  );
}
