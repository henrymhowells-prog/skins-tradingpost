import { revalidatePath } from "next/cache";
import AppShell from "../../components/AppShell";
import { supabase } from "../../lib/supabase";
import { getCurrentUser } from "../../lib/currentUser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function requireAdmin() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Not allowed.");
  }

  return currentUser;
}

async function resolveReport(formData: FormData) {
  "use server";

  await requireAdmin();

  const reportId = String(formData.get("report_id") || "");

  await supabase.from("reports").update({ status: "resolved" }).eq("id", reportId);

  revalidatePath("/admin/reports");
}

async function reopenReport(formData: FormData) {
  "use server";

  await requireAdmin();

  const reportId = String(formData.get("report_id") || "");

  await supabase.from("reports").update({ status: "open" }).eq("id", reportId);

  revalidatePath("/admin/reports");
}

async function deleteReport(formData: FormData) {
  "use server";

  await requireAdmin();

  const reportId = String(formData.get("report_id") || "");

  await supabase.from("reports").delete().eq("id", reportId);

  revalidatePath("/admin/reports");
}

async function deleteReportedListing(formData: FormData) {
  "use server";

  await requireAdmin();

  const listingId = String(formData.get("listing_id") || "");
  const reportId = String(formData.get("report_id") || "");

  if (!listingId) return;

  await supabase.from("listing_offer_items").delete().eq("listing_id", listingId);
  await supabase.from("listing_wanted_items").delete().eq("listing_id", listingId);
  await supabase.from("listing_views").delete().eq("listing_id", listingId);
  await supabase.from("saved_listings").delete().eq("listing_id", listingId);
  await supabase.from("listings").delete().eq("id", listingId);

  if (reportId) {
    await supabase.from("reports").update({ status: "resolved" }).eq("id", reportId);
  }

  revalidatePath("/admin/reports");
  revalidatePath("/browse");
  revalidatePath("/listings");
}

async function banReportedUser(formData: FormData) {
  "use server";

  const currentUser = await requireAdmin();

  const userId = String(formData.get("user_id") || "");
  const reportId = String(formData.get("report_id") || "");
  const reason = String(formData.get("ban_reason") || "Banned by admin.");

  if (!userId) return;

  if (userId === currentUser.id) {
    throw new Error("You cannot ban yourself.");
  }

  await supabase
    .from("users")
    .update({
      is_banned: true,
      banned_reason: reason,
      banned_at: new Date().toISOString(),
    })
    .eq("id", userId);

  await supabase.from("listings").delete().eq("user_id", userId);

  if (reportId) {
    await supabase.from("reports").update({ status: "resolved" }).eq("id", reportId);
  }

  revalidatePath("/admin/reports");
  revalidatePath("/browse");
  revalidatePath("/listings");
}

async function unbanReportedUser(formData: FormData) {
  "use server";

  await requireAdmin();

  const userId = String(formData.get("user_id") || "");

  if (!userId) return;

  await supabase
    .from("users")
    .update({
      is_banned: false,
      banned_reason: null,
      banned_at: null,
    })
    .eq("id", userId);

  revalidatePath("/admin/reports");
}

export default async function AdminReportsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <AppShell>
        <h1 className="text-4xl font-bold">Not Allowed</h1>
      </AppShell>
    );
  }

  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: users } = await supabase.from("users").select("*");
  const { data: listings } = await supabase.from("listings").select("*");

  return (
    <AppShell>
      <h1 className="text-4xl font-bold">Admin Reports</h1>

      <div className="mt-8 grid gap-5">
        {(reports || []).length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-500">
            No reports yet.
          </div>
        ) : (
          reports?.map((report) => {
            const reporter = (users || []).find((user) => user.id === report.reporter_id);
            const reportedUser = (users || []).find((user) => user.id === report.reported_user_id);
            const reportedListing = (listings || []).find((listing) => listing.id === report.listing_id);

            return (
              <div key={report.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {report.report_type || "Report"}
                    </h2>

                    <p className="mt-2 text-zinc-300">
                      Reason: {report.reason || "No reason"}
                    </p>

                    {report.details && (
                      <p className="mt-2 text-zinc-400">
                        Details: {report.details}
                      </p>
                    )}

                    <div className="mt-4 space-y-1 text-sm text-zinc-500">
                      <p>Status: {report.status || "open"}</p>
                      <p>Reporter: {reporter?.steam_name || reporter?.username || report.reporter_id || "Unknown"}</p>
                      <p>Reported User: {reportedUser?.steam_name || reportedUser?.username || report.reported_user_id || "None"}</p>
                      <p>Listing: {reportedListing?.title || report.listing_id || "None"}</p>
                      <p>
                        Created:{" "}
                        {report.created_at
                          ? new Date(report.created_at).toLocaleString()
                          : "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 xl:justify-end">
                    {report.listing_id && (
                      <a
                        href={`/trade/${report.listing_id}`}
                        className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400"
                      >
                        View Trade
                      </a>
                    )}

                    {report.reported_user_id && (
                      <a
                        href={`/user/${report.reported_user_id}`}
                        className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold hover:bg-zinc-800"
                      >
                        View User
                      </a>
                    )}

                    {report.status === "resolved" ? (
                      <form action={reopenReport}>
                        <input type="hidden" name="report_id" value={report.id} />
                        <button className="rounded-xl border border-yellow-500 px-5 py-3 font-semibold text-yellow-400 hover:bg-yellow-500 hover:text-black">
                          Reopen
                        </button>
                      </form>
                    ) : (
                      <form action={resolveReport}>
                        <input type="hidden" name="report_id" value={report.id} />
                        <button className="rounded-xl border border-green-500 px-5 py-3 font-semibold text-green-400 hover:bg-green-500 hover:text-black">
                          Resolve
                        </button>
                      </form>
                    )}

                    {report.listing_id && (
                      <form action={deleteReportedListing}>
                        <input type="hidden" name="report_id" value={report.id} />
                        <input type="hidden" name="listing_id" value={report.listing_id} />
                        <button className="rounded-xl border border-red-500 px-5 py-3 font-semibold text-red-400 hover:bg-red-500 hover:text-white">
                          Delete Listing
                        </button>
                      </form>
                    )}

                    {reportedUser && !reportedUser.is_banned && (
                      <form action={banReportedUser} className="flex gap-2">
                        <input type="hidden" name="report_id" value={report.id} />
                        <input type="hidden" name="user_id" value={reportedUser.id} />

                        <input
                          name="ban_reason"
                          placeholder="Ban reason"
                          className="w-40 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-red-500"
                        />

                        <button className="rounded-xl border border-red-500 px-5 py-3 font-semibold text-red-400 hover:bg-red-500 hover:text-white">
                          Ban User
                        </button>
                      </form>
                    )}

                    {reportedUser?.is_banned && (
                      <form action={unbanReportedUser}>
                        <input type="hidden" name="user_id" value={reportedUser.id} />
                        <button className="rounded-xl border border-blue-500 px-5 py-3 font-semibold text-blue-400 hover:bg-blue-500 hover:text-white">
                          Unban User
                        </button>
                      </form>
                    )}

                    <form action={deleteReport}>
                      <input type="hidden" name="report_id" value={report.id} />
                      <button className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-400 hover:bg-zinc-800">
                        Delete Report
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </AppShell>
  );
}