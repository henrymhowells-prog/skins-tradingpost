import AppShell from "../components/AppShell";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function PageBackground() {
  return (
    <div className="fixed inset-y-0 left-64 right-0 z-0 overflow-hidden bg-[#121318]">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="absolute -left-20 top-0 h-full w-40 -skew-x-12 bg-blue-800" />
      <div className="absolute left-64 top-72 h-[700px] w-72 -skew-x-12 bg-blue-800" />

      <div className="absolute -right-20 top-0 h-full w-44 -skew-x-12 bg-orange-500" />
      <div className="absolute right-12 top-0 h-full w-24 -skew-x-12 bg-orange-400/70" />

      <div className="absolute right-20 top-12 text-4xl font-black italic text-white/70">
        BETA
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AppShell>
      <PageBackground />

      <div className="relative z-10">
        <h1 className="text-5xl font-bold">Settings</h1>

        <p className="mt-3 text-zinc-300">
          Manage your account, trading preferences and safety settings.
        </p>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <div className="rounded-[32px] border border-zinc-800 bg-black/80 p-8 backdrop-blur">
            <h2 className="text-3xl font-black italic tracking-wide">
              Trade Preferences
            </h2>

            <div className="mt-8 space-y-5">
              <label className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5">
                <span className="font-medium">
                  Allow players to message me
                </span>

                <input
                  type="checkbox"
                  className="h-5 w-5 accent-orange-500"
                />
              </label>

              <label className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5">
                <span className="font-medium">
                  Show my public trade listings
                </span>

                <input
                  type="checkbox"
                  className="h-5 w-5 accent-orange-500"
                />
              </label>

              <label className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5">
                <span className="font-medium">
                  Enable Notifications
                </span>

                <input
                  type="checkbox"
                  className="h-5 w-5 accent-orange-500"
                />
              </label>
            </div>
          </div>

          <div className="rounded-[32px] border border-zinc-800 bg-black/80 p-8 backdrop-blur">
            <h2 className="text-3xl font-black italic tracking-wide">
              Safety
            </h2>

            <div className="mt-8 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5">
              <p className="font-semibold text-orange-400">
                Trading Safety Reminder
              </p>

              <p className="mt-3 text-zinc-300">
                Skins TradingPost will never ask you to send skins to a bot,
                middleman or administrator.
              </p>

              <p className="mt-3 text-zinc-300">
                Always complete trades through the official Steam trading
                system.
              </p>

              <p className="mt-3 text-zinc-300">
                Never share your Steam password, authenticator codes or account
                recovery details.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5">
              <h3 className="font-bold">Account Status</h3>

              <p className="mt-2 text-green-400">
                ✓ Account active and in good standing
              </p>
            </div>

            <div className="mt-10 rounded-3xl border border-red-500/30 bg-red-500/10 p-6">
  <h2 className="text-2xl font-bold text-red-400">
    Account
  </h2>

  <p className="mt-2 text-zinc-400">
    Sign out of your account on this device.
  </p>

  <a
    href="/logout"
    className="mt-6 inline-block rounded-xl bg-red-500 px-6 py-3 font-semibold text-white transition hover:bg-red-600"
  >
    Log Out
  </a>
</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}