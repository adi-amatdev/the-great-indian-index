"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  inviteCollaboratorAction,
  removeCollaboratorAction,
} from "@/app/actions";
import type { Collaborator } from "@/lib/custom-indexes";

type State = { error?: string; ok?: boolean } | undefined;

function InviteForm({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState(
    async (_prev: State, formData: FormData) => inviteCollaboratorAction(formData),
    undefined,
  );
  const [username, setUsername] = useState("");

  return (
    <form
      action={action}
      onSubmit={() => setUsername("")}
      className="space-y-1.5"
    >
      <div className="flex gap-2">
        <input
          type="hidden"
          name="id"
          value={slug}
        />
        <input
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="@username"
          aria-label="Username to invite as co-owner"
          className="min-w-0 flex-1 rounded-lg border border-surface bg-background px-2.5 py-1.5 font-mono text-xs text-foreground outline-none transition placeholder:text-muted-light focus:border-accent"
        />
        <button
          type="submit"
          disabled={pending || !username.trim()}
          className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-white transition hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? "…" : "Invite"}
        </button>
      </div>
      {state?.ok && (
        <p className="text-[11px] font-semibold text-up">Invited as co-owner.</p>
      )}
      {state?.error && (
        <p className="text-[11px] font-semibold text-down">{state.error}</p>
      )}
    </form>
  );
}

function RemoveButton({
  slug,
  username,
}: {
  slug: string;
  username: string;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: State, formData: FormData) => removeCollaboratorAction(formData),
    undefined,
  );
  return (
    <form action={action} className="inline-flex items-center gap-1">
      <input type="hidden" name="id" value={slug} />
      <input type="hidden" name="username" value={username} />
      <button
        type="submit"
        disabled={pending}
        title={`Remove @${username}`}
        aria-label={`Remove @${username}`}
        className="grid h-5 w-5 place-items-center rounded-full text-muted transition hover:bg-down-bg hover:text-down disabled:opacity-40"
      >
        ×
      </button>
      {state?.error && (
        <span className="text-[10px] font-semibold text-down">{state.error}</span>
      )}
    </form>
  );
}

export default function CollaboratorManager({
  slug,
  collaborators,
  isCreator,
}: {
  slug: string;
  collaborators: Collaborator[];
  isCreator: boolean;
}) {
  return (
    <div className="rounded-xl border border-surface bg-background/50 p-3">
      <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
        Co-owners · {collaborators.length}
      </p>

      {collaborators.length > 0 && (
        <ul className="mt-2 space-y-1">
          {collaborators.map((collaborator) => (
            <li key={collaborator.userId.toString()}>
              <span className="inline-flex max-w-full items-center gap-1.5">
                <Link
                  href={`/user/${collaborator.username}`}
                  className="truncate font-mono text-xs font-semibold text-foreground transition hover:text-accent"
                >
                  @{collaborator.username}
                </Link>
                {collaborator.role === "owner" && (
                  <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                    owner
                  </span>
                )}
                {isCreator && (
                  <RemoveButton slug={slug} username={collaborator.username} />
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2 border-t border-surface/70 pt-2">
        <InviteForm slug={slug} />
      </div>
    </div>
  );
}