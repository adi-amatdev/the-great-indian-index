"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

function DeleteSubmit() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="rounded-full bg-down px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">{pending ? "Deleting…" : "Confirm delete"}</button>;
}

export default function DeleteCustomIndexButton({ action, slug }: { action: (formData: FormData) => void | Promise<void>; slug: string }) {
  const [confirming, setConfirming] = useState(false);
  if (!confirming) return <button type="button" onClick={() => setConfirming(true)} className="text-sm font-bold text-down transition hover:underline">Delete index</button>;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={action}>
        <input type="hidden" name="id" value={slug} />
        <DeleteSubmit />
      </form>
      <button type="button" onClick={() => setConfirming(false)} className="rounded-full border border-surface px-3 py-1.5 text-xs font-bold text-muted">Cancel</button>
    </div>
  );
}
