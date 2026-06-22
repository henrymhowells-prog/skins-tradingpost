import { revalidatePath } from "next/cache";
import AppShell from "../components/AppShell";
import { supabase } from "../lib/supabase";
import { getCurrentUser } from "../lib/currentUser";

async function submitReport(formData: FormData) {
  "use server";

  const reportedUserId =
    String(formData.get("reported_user_id") || "") || null;

  const listingId =
    String(formData.get("listing_id") || "") || null;

  const reportType = String(formData.get("report_type") || "").trim();
  const reason = String(formData.get("reason") || "").trim();
  const details = String(formData.get("details") || "").trim();

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("You must be signed in with Steam to submit a report.");
  }

  if (!reportType || !reason) {
    throw new Error("Report type and reason are required.");
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: currentUser.id,
    reported_user_id: reportedUserId,
    listing_id: listingId,
    report_type: reportType,
    reason,
    details,
    status: "open",
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/report");
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams?: Promise<{ user?: string; listing?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const reportedUserId = params.user || "";
  const listingId = params.listing || "";

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <AppShell>
        <h1 className="text-4xl font-bold">Please sign in with Steam</h1>

        <a
          href="/api/auth/steam/login"
          className="mt-6 inline-block rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400"
        >
          Sign in with Steam
        </a>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <h1 className="text-4xl font-bold">Report</h1>

      <p className="mt-2 text-zinc-400">
        Report a suspicious user, listing, scam attempt, or abusive behaviour.
      </p>

      <form
        action={submitReport}
        className="mt-8 max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
      >
        <input type="hidden" name="reported_user_id" value={reportedUserId} />
        <input type="hidden" name="listing_id" value={listingId} />

        <div>
          <label className="text-sm text-zinc-400">Report Type</label>

          <select
            name="report_type"
            required
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
          >
            <option value="">Select a report type</option>
            <option value="scam">Scam attempt</option>
            <option value="fake_listing">Fake listing</option>
            <option value="abuse">Abusive behaviour</option>
            <option value="spam">Spam</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="mt-5">
          <label className="text-sm text-zinc-400">Reason</label>

          <input
            name="reason"
            required
            placeholder="Short reason..."
            className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
          />
        </div>

        <div className="mt-5">
          <label className="text-sm text-zinc-400">Details</label>

          <textarea
            name="details"
            placeholder="Add any extra details..."
            className="mt-2 min-h-36 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
          />
        </div>

        <button className="mt-6 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-black hover:bg-orange-400">
          Submit Report
        </button>
      </form>
    </AppShell>
  );
}