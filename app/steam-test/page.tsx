export default function SteamTestPage() {
  return (
    <main className="min-h-screen bg-zinc-950 p-10 text-white">
      <h1 className="text-3xl font-bold">Steam Test</h1>

      <a
        href="/api/auth/steam"
        className="mt-6 inline-block rounded-xl bg-orange-500 px-5 py-3 font-bold text-black"
      >
        Login With Steam
      </a>
    </main>
  );
}