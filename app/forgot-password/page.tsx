"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="text-center text-4xl font-black text-white">
          Reset Password
        </h1>

        {sent ? (
          <div className="mt-8 rounded-xl border border-green-500 bg-green-500/10 p-5 text-center text-green-300">
            Check your email for a password reset link.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-8 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-white outline-none focus:border-orange-500"
            />

            {error && (
              <p className="mt-4 rounded-lg bg-red-900/40 p-3 text-red-300">
                {error}
              </p>
            )}

            <button className="mt-6 w-full rounded-xl bg-orange-500 p-4 font-bold text-black hover:bg-orange-400">
              Send Reset Link
            </button>
          </form>
        )}

        <a
          href="/login"
          className="mt-6 block text-center font-semibold text-orange-400 hover:text-orange-300"
        >
          Back to Sign In
        </a>
      </div>
    </main>
  );
}