import AppShell from "../components/AppShell";
import { getCurrentUser } from "../lib/currentUser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BannedPage() {
  const currentUser = await getCurrentUser();

  return (
    <AppShell>
      <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8">
        <h1 className="text-5xl font-bold text-red-400">Account Banned</h1>

        <p className="mt-4 max-w-2xl text-zinc-300">
          Your account has been banned from using Skins TradingPost.
        </p>

        {currentUser?.banned_reason && (
          <p className="mt-4 rounded-2xl border border-red-500/30 bg-black/40 p-4 text-red-300">
            Reason: {currentUser.banned_reason}
          </p>
        )}

        <p className="mt-6 text-sm text-zinc-500">
          If you think this is a mistake, contact support.
        </p>
      </div>
    </AppShell>
  );
}