"use client";

import { useState } from "react";
import { deleteAccountAction } from "@/app/actions";
import Panel from "./ui/Panel";
import SubmitButton from "./ui/SubmitButton";

export default function AccountDangerZone() {
  const [open, setOpen] = useState(false);
  return (
    <Panel label="Delete account" context="permanent" className="border-down/30" bodyClassName="p-5">
      {!open ? (
        <button onClick={() => setOpen(true)} className="rounded-full border border-down/40 px-3 py-1.5 text-xs font-bold text-down transition hover:bg-down-bg">Delete my account and data</button>
      ) : (
        <form action={deleteAccountAction} className="space-y-3">
          <p className="text-sm leading-relaxed text-down">This permanently deletes your profile, paper portfolio, trades, custom indexes, and collaborations.</p>
          <input name="confirmation" required placeholder="Type DELETE to confirm" className="w-full rounded-xl border border-down/40 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-down" />
          <div className="flex gap-2">
            <SubmitButton pendingLabel="Deleting…" className="rounded-full bg-down px-3 py-1.5 text-xs font-bold text-white">Delete permanently</SubmitButton>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-surface px-3 py-1.5 text-xs font-bold text-muted">Cancel</button>
          </div>
        </form>
      )}
    </Panel>
  );
}
