import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../lib/supabaseServer";
import { supabase as adminSupabase } from "../lib/supabase";

async function signUp(formData: FormData) {
  "use server";

  const username = String(formData.get("username") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!username || !email || !password) {
    redirect("/signup?error=Missing required fields");
  }

  const supabase = await createSupabaseServerClient();

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.user) {
    redirect("/signup?error=Unable to create account");
  }

  const { data: existingUser } = await adminSupabase
    .from("users")
    .select("id")
    .eq("auth_user_id", data.user.id)
    .maybeSingle();

  if (!existingUser) {
    const { error: insertError } = await adminSupabase.from("users").insert({
      auth_user_id: data.user.id,
      email,
      username,
      average_rating: 5,
      review_count: 0,
      trade_count: 0,
      role: "user",
    });

    if (insertError) {
      redirect(`/signup?error=${encodeURIComponent(insertError.message)}`);
    }
  }

  redirect(`/check-email?email=${encodeURIComponent(email)}`);
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const error = params.error;

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
      <form
        action={signUp}
        className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-8"
      >
        <h1 className="mb-8 text-center text-4xl font-black text-white">
          Create Account
        </h1>

        <input
          name="username"
          className="mb-4 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-white"
          placeholder="Username"
          required
        />

        <input
          name="email"
          className="mb-4 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-white"
          placeholder="Email"
          type="email"
          required
        />

        <input
          name="password"
          className="mb-6 w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-white"
          placeholder="Password"
          type="password"
          required
        />

        {error && (
          <p className="mb-4 rounded-lg bg-red-900/40 p-3 text-red-300">
            {error}
          </p>
        )}

        <button className="w-full rounded-xl bg-orange-500 p-4 font-bold text-black hover:bg-orange-400">
          Create Account
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
      </form>
    </main>
  );
}