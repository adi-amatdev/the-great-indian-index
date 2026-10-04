"use client";

import { useActionState, useState } from "react";
import { updateProfileAction } from "@/app/actions";
import Panel from "./ui/Panel";
import SubmitButton from "./ui/SubmitButton";

type State = { error?: string; ok?: boolean } | undefined;
type LinkRow = { label: string; url: string };
const emptyLink: LinkRow = { label: "", url: "" };

export default function ProfileEditForm({
  bio = "",
  email = "",
  about = "",
  links = [],
}: {
  bio?: string;
  email?: string;
  about?: string;
  links?: LinkRow[];
}) {
  const [state, action] = useActionState(
    async (_prev: State, formData: FormData) => updateProfileAction(_prev, formData),
    undefined,
  );
  const [rows, setRows] = useState<LinkRow[]>(links.length ? links : [emptyLink]);

  function updateRow(index: number, key: keyof LinkRow, value: string) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    );
  }
  function addRow() {
    setRows((current) => [...current, { ...emptyLink }]);
  }
  function removeRow(index: number) {
    setRows((current) => current.filter((_, i) => i !== index));
  }

  return (
    <Panel label="Edit profile" context="only you can see this" bodyClassName="p-5">
      <form action={action} className="space-y-3">
        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-wider text-muted">Email</span>
          <input name="email" type="email" defaultValue={email} placeholder="you@example.com" className="w-full rounded-xl border border-surface bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-light focus:border-accent" />
        </label>

        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-wider text-muted">
            Bio
          </span>
          <input
            name="bio"
            defaultValue={bio}
            maxLength={160}
            placeholder="One line about you"
            className="w-full rounded-xl border border-surface bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-light focus:border-accent"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-wider text-muted">
            About
          </span>
          <textarea
            name="about"
            defaultValue={about}
            maxLength={1000}
            rows={4}
            placeholder="Your story, approach, what you're watching…"
            className="w-full rounded-xl border border-surface bg-background px-3 py-2 text-sm leading-relaxed text-foreground outline-none transition placeholder:text-muted-light focus:border-accent"
          />
        </label>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">
              Links
            </span>
            <button
              type="button"
              onClick={addRow}
              className="text-xs font-bold text-accent transition hover:underline"
            >
              + Add
            </button>
          </div>
          <div className="space-y-1.5">
            {rows.map((row, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <input
                  aria-label={`Link ${index + 1} label`}
                  value={row.label}
                  onChange={(e) => updateRow(index, "label", e.target.value)}
                  placeholder="X / GitHub / blog…"
                  className="w-28 shrink-0 rounded-lg border border-surface bg-background px-2.5 py-1.5 text-xs text-foreground outline-none transition placeholder:text-muted-light focus:border-accent"
                />
                <input
                  aria-label={`Link ${index + 1} URL`}
                  value={row.url}
                  onChange={(e) => updateRow(index, "url", e.target.value)}
                  placeholder="https://…"
                  inputMode="url"
                  className="min-w-0 flex-1 rounded-lg border border-surface bg-background px-2.5 py-1.5 text-xs text-foreground outline-none transition placeholder:text-muted-light focus:border-accent"
                />
                <button
                  type="button"
                  aria-label={`Remove link ${index + 1}`}
                  onClick={() => removeRow(index)}
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-surface text-muted transition hover:border-down hover:text-down"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <input type="hidden" name="links" value={JSON.stringify(rows)} readOnly />

        {state?.ok && (
          <p className="rounded-xl bg-up-bg px-3 py-2 text-xs font-semibold text-up">
            Profile saved.
          </p>
        )}
        {state?.error && (
          <p role="alert" className="rounded-xl bg-down-bg px-3 py-2 text-xs font-semibold text-down">
            {state.error}
          </p>
        )}

        <SubmitButton pendingLabel="Saving…" className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white transition hover:bg-accent-hover">
          Save profile
        </SubmitButton>
      </form>
    </Panel>
  );
}
