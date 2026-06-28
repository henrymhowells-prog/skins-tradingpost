"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "../lib/supabaseBrowser";

const supabase = createSupabaseBrowserClient();

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="text-center text-4xl font-black text-white">
          New Password
        </h1>

        {success ? (
          <div className="mt-8 text-center">
            <div className="rounded-xl border border-green-500 bg-green-500/10 p-5 text-green-300">
              Your password has been updated.
            </div>

            <a
              href="/login"
              className="mt-6 inline-block rounded-xl bg-orange-500 px-6 py-3 font-bold text-black hover:bg-orange-400"
            >
              Sign In
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              required
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-8 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-white outline-none focus:border-orange-500"
            />

            <input
              type="password"
              required
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-4 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-white outline-none focus:border-orange-500"
            />

            {error && (
              <p className="mt-4 rounded-lg bg-red-900/40 p-3 text-red-300">
                {error}
              </p>
            )}

            <button className="mt-6 w-full rounded-xl bg-orange-500 p-4 font-bold text-black hover:bg-orange-400">
              Update Password
            </button>
          </form>
        )}
      </div>
    </main>
  );
}