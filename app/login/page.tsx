import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AuthForm from "@/components/AuthForm";
import { TrendMark } from "@/components/ui/icons";

export const metadata = { title: "Log in - Bharat Indexes" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/portfolio");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-14 sm:px-5">
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
        {/* Editorial intro */}
        <div>
          <div className="mb-5 inline-flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-white shadow-sm shadow-accent/30">
              <TrendMark className="h-5 w-5" />
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">
              Bharat Indexes
            </span>
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-foreground sm:text-5xl">
            Practise investing.
            <br />
            <span className="text-muted">No real money.</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted sm:text-base">
            Start with <span className="font-semibold text-foreground">₹10,00,000</span> of
            virtual cash and trade India&apos;s biggest themes as single index
            baskets — equal weight or market cap, all priced live.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              "11 themed indexes",
              "paper trading",
              "custom baskets",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-surface bg-background/60 px-3 py-1 font-mono text-xs text-muted"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="mx-auto w-full max-w-sm">
          <AuthForm />
          <p className="mt-4 text-center text-xs text-muted-light">
            <Link href="/" className="font-semibold text-muted transition hover:text-foreground">
              ← Back to indexes
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}