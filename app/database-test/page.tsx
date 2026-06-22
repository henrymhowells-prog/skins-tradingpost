import { supabase } from "../lib/supabase";

export default async function DatabaseTestPage() {
  const { data, error } = await supabase
    .from("listings")
    .select("*");

  return (
    <main className="min-h-screen bg-zinc-950 p-8 text-white">
      <h1 className="text-4xl font-bold">Database Test</h1>

      {error ? (
        <pre className="mt-6 rounded-xl bg-red-950 p-4 text-red-300">
          {error.message}
        </pre>
      ) : (
        <pre className="mt-6 rounded-xl bg-zinc-900 p-4 text-green-300">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </main>
  );
}