export default async function SteamSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ steamId?: string }>;
}) {
  const { steamId } = await searchParams;

  return (
    <main className="p-10 text-white">
      <h1 className="text-3xl font-bold">
        Steam Connected
      </h1>

      <p className="mt-4">
        Steam ID received successfully.
      </p>

      <p className="mt-2 text-zinc-400">
        {steamId}
      </p>
    </main>
  );
}