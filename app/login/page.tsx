import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../lib/supabaseServer";

async function login(formData: FormData) {
  "use server";

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) return;

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const error = params.error;

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
      <form
        action={login}
        className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <h1 className="mb-8 text-center text-4xl font-black text-white">
          Sign In
        </h1>

        <input
          name="email"
          className="mb-4 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-white"
          placeholder="Email"
          type="email"
          required
        />

        <input
          name="password"
          className="mb-4 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-white"
          placeholder="Password"
          type="password"
          required
        />

        <label className="mb-6 flex items-center gap-3 text-sm text-zinc-300">
          <input
            type="checkbox"
            name="remember"
            defaultChecked
            className="h-4 w-4 accent-orange-500"
          />
          Remember me on this device
        </label>

        {error && (
          <p className="mb-4 rounded-lg bg-red-900/40 p-3 text-red-300">
            {error}
          </p>
        )}

        <button className="w-full rounded-xl bg-orange-500 p-4 font-bold text-black hover:bg-orange-400">
          Sign In
        </button>

        <p className="mt-6 text-center text-zinc-400">
          Don't have an account?
        </p>

        <a
          href="/signup"
          className="mt-3 block text-center font-bold text-orange-400 hover:text-orange-300"
        >
          Create Account
        </a>
      </form>
    </main>
  );
}