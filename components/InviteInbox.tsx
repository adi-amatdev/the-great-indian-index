"use client";

import { useActionState } from "react";
import { acceptInviteAction, declineInviteAction } from "@/app/actions";
import type { IndexInvite } from "@/lib/custom-indexes";
import Link from "next/link";

type State = { error?: string; ok?: boolean } | undefined;

function InviteAction({ inviteId, accept }: { inviteId: bigint; accept: boolean }) {
  const action = accept ? acceptInviteAction : declineInviteAction;
  const [state, formAction, pending] = useActionState(
    async (_prev: State, formData: FormData) => action(formData),
    undefined,
  );
  return (
    <form action={formAction}>
      <input type="hidden" name="inviteId" value={inviteId.toString()} />
      <button
        disabled={pending}
        className={`rounded-full px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${accept ? "bg-accent text-white hover:bg-accent-hover" : "border border-surface text-muted hover:border-down hover:text-down"}`}
      >
        {pending ? "Working…" : accept ? "Accept" : "Decline"}
      </button>
      {state?.error && <span className="ml-2 text-[11px] text-down">{state.error}</span>}
    </form>
  );
}

export default function InviteInbox({ invites }: { invites: IndexInvite[] }) {
  if (!invites.length) {
    return <div className="rounded-2xl border border-dashed border-surface p-10 text-center text-sm text-muted">No pending invites.</div>;
  }
  return (
    <div className="space-y-3">
      {invites.map((invite) => (
        <article key={invite.id.toString()} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-surface bg-surface/40 p-5">
          <div>
            <h2 className="font-bold text-foreground">{invite.indexName}</h2>
            <p className="mt-1 text-sm text-muted">@{invite.inviterUsername} invited you as a co-owner.</p>
            <Link href={`/compare?left=${invite.slug}`} className="mt-2 inline-block text-xs font-semibold text-accent hover:underline">Preview analysis</Link>
          </div>
          <div className="flex items-center gap-2">
            <InviteAction inviteId={invite.id} accept />
            <InviteAction inviteId={invite.id} accept={false} />
          </div>
        </article>
      ))}
    </div>
  );
}
