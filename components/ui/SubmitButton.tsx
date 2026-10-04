"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

export default function SubmitButton({ children, pendingLabel = "Working…", className = "" }: { children: ReactNode; pendingLabel?: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${className} disabled:cursor-not-allowed disabled:opacity-50`}>
      {pending ? pendingLabel : children}
    </button>
  );
}
