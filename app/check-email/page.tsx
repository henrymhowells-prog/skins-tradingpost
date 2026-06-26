export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams?: Promise<{ email?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const email = params.email || "your email";

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-white">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-500 text-4xl text-black">
          ✉️
        </div>

        <h1 className="mt-6 text-4xl font-black">Check your email</h1>

        <p className="mt-4 text-zinc-300">
          We sent a confirmation link to:
        </p>

        <p className="mt-2 font-bold text-orange-400">{email}</p>

        <p className="mt-6 text-sm text-zinc-400">
          Click the link in your email to confirm your account. Once confirmed,
          you’ll be sent straight into Skins TradingPost.
        </p>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">
          You can close this page after confirming your email.
        </div>

        <a
          href="/login"
          className="mt-6 inline-block rounded-xl border border-zinc-700 px-5 py-3 font-semibold hover:bg-zinc-800"
        >
          Back to Sign In
        </a>
      </div>
    </main>
  );
}