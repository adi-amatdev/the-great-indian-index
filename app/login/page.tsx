import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Log in — Bharat Indexes" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/portfolio");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-5 py-16">
      <Link
        href="/"
        className="mb-6 text-sm text-white/50 transition hover:text-white"
      >
        ← Back to indexes
      </Link>
      <div className="mb-6 text-center">
        <h1 className="bg-gradient-to-r from-orange-300 via-white to-green-300 bg-clip-text text-3xl font-black text-transparent">
          Start paper trading
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Get ₹10,00,000 in virtual money and invest across India&apos;s themes.
        </p>
      </div>
      <AuthForm />
    </main>
  );
}
