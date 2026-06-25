"use client";

import { useState } from "react";

export default function ProfileBio({
  bio,
  saveAction,
}: {
  bio: string;
  saveAction: (formData: FormData) => void;
}) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <div className="mt-4 max-w-2xl">
        <p className="text-zinc-300 whitespace-pre-wrap">
          {bio || "No bio added yet."}
        </p>

        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-4 rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
        >
          ✏️ Edit Bio
        </button>
      </div>
    );
  }

  return (
    <form
      action={saveAction}
      className="mt-4 max-w-2xl"
    >
      <textarea
        name="bio"
        defaultValue={bio}
        className="h-28 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
      />

      <p className="mt-2 text-xs text-zinc-500">
        Maximum 100 words.
      </p>

      <div className="mt-4 flex gap-3">
        <button
          className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black hover:bg-orange-400"
        >
          Save Bio
        </button>

        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-xl border border-zinc-700 px-5 py-3 hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}