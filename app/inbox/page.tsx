import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listPendingInvites } from "@/lib/custom-indexes";
import PageHeader from "@/components/ui/PageHeader";
import InviteInbox from "@/components/InviteInbox";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inbox - Bharat Indexes" };

export default async function InboxPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const invites = await listPendingInvites(user.id);
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-5 sm:py-12">
      <PageHeader eyebrow="Collaboration inbox" title="Your invites" description="Accept invitations to co-own custom indexes, or decline them here." />
      <InviteInbox invites={invites} />
    </main>
  );
}
