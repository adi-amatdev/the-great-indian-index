"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { deleteDiscussionPostAction, postDiscussionAction } from "@/app/actions";
import Panel from "./ui/Panel";
import SubmitButton from "./ui/SubmitButton";

type Post = { id: string; body: string; username: string; userId: string; createdAt: number };
type State = { error?: string; ok?: boolean } | undefined;

function DeletePost({ postId, slug }: { postId: string; slug: string }) {
  const [state, action, pending] = useActionState(async (_prev: State, formData: FormData) => deleteDiscussionPostAction(formData), undefined);
  return (
    <form action={action} className="inline">
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="slug" value={slug} />
      <button disabled={pending} className="text-[11px] text-muted-light transition hover:text-down disabled:opacity-40">{pending ? "…" : "Delete"}</button>
      {state?.error && <span className="ml-2 text-[10px] text-down">{state.error}</span>}
    </form>
  );
}

export default function IndexDiscussion({ slug, posts, currentUserId }: { slug: string; posts: Post[]; currentUserId: string | null }) {
  const [query, setQuery] = useState("");
  const [state, action] = useActionState(async (_prev: State, formData: FormData) => postDiscussionAction(_prev, formData), undefined);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? posts.filter((post) => `${post.body} ${post.username}`.toLowerCase().includes(needle)) : posts;
  }, [posts, query]);

  return (
    <Panel label="Index room" context={`${posts.length} posts`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm leading-relaxed text-muted">A focused room for the people researching this index. Ask questions, share context, and keep the username attached to every post.</p>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search this room…" aria-label="Search index discussion" className="w-full rounded-xl border border-surface bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent sm:w-52" />
      </div>

      {currentUserId ? (
        <form action={action} className="mt-4 space-y-2 border-t border-surface pt-4">
          <input type="hidden" name="slug" value={slug} />
          <textarea name="body" required maxLength={1000} rows={3} placeholder="Post a question or observation…" className="w-full rounded-xl border border-surface bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground outline-none focus:border-accent" />
          <div className="flex items-center justify-between gap-3">
            {state?.error ? <span className="text-xs font-semibold text-down">{state.error}</span> : <span className="text-[11px] text-muted-light">Be specific and useful to the room.</span>}
            <SubmitButton pendingLabel="Posting…" className="rounded-full bg-accent px-4 py-2 text-xs font-bold text-white hover:bg-accent-hover">Post</SubmitButton>
          </div>
        </form>
      ) : (
        <p className="mt-4 border-t border-surface pt-4 text-sm text-muted"><Link href="/login" className="font-semibold text-accent hover:underline">Log in</Link> to join the room.</p>
      )}

      <div className="mt-5 space-y-3">
        {filtered.length ? filtered.map((post) => (
          <article key={post.id} className="rounded-xl border border-surface bg-background/55 p-3.5">
            <div className="flex items-center justify-between gap-3">
              <Link href={`/user/${post.username}`} className="font-mono text-xs font-bold text-foreground hover:text-accent">@{post.username}</Link>
              <time className="font-mono text-[10px] text-muted-light">{new Date(post.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</time>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">{post.body}</p>
            {currentUserId === post.userId && <div className="mt-2"><DeletePost postId={post.id} slug={slug} /></div>}
          </article>
        )) : <p className="rounded-xl border border-dashed border-surface p-6 text-center text-sm text-muted">{query ? "No posts match that search." : "No posts yet. Start the conversation."}</p>}
      </div>
    </Panel>
  );
}
