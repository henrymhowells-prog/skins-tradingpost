"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function signUp(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Unable to create account.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("users").insert({
      auth_user_id: data.user.id,
      email,
      username,
      average_rating: 5,
      review_count: 0,
      trade_count: 0,
      role: "user",
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
      <form
        onSubmit={signUp}
        className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <h1 className="mb-8 text-center text-4xl font-black text-white">
          Create Account
        </h1>

        <input
          className="mb-4 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-white"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          className="mb-4 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-white"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="mb-6 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-white"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="mb-4 rounded-lg bg-red-900/40 p-3 text-red-300">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          className="w-full rounded-xl bg-orange-500 p-4 font-bold text-black hover:bg-orange-400"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="mt-6 text-center text-zinc-400">
          Already have an account?
        </p>

        <a
          href="/login"
          className="mt-3 block text-center font-bold text-orange-400 hover:text-orange-300"
        >
          Sign In
        </a>

        <div className="my-6 border-t border-zinc-800" />

        <a
          href="/api/auth/steam/login"
          className="block rounded-xl border border-orange-500 p-4 text-center font-bold text-orange-400 hover:bg-orange-500 hover:text-black"
        >
          Continue with Steam instead
        </a>
      </form>
    </main>
  );
}