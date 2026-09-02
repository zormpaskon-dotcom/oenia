"use client";

import { useActionState } from "react";
import { submitReviewAction, type ReviewActionState } from "@/lib/actions/reviews";

const initialState: ReviewActionState = { error: null };

export default function ReviewForm({
  wineId,
  wineSlug,
  existing,
}: {
  wineId: string;
  wineSlug: string;
  existing?: { rating: number; note: string | null };
}) {
  const [state, formAction, pending] = useActionState(submitReviewAction, initialState);

  return (
    <form action={formAction} className="review-form">
      <input type="hidden" name="wineId" value={wineId} />
      <input type="hidden" name="wineSlug" value={wineSlug} />
      <div className="field">
        <label htmlFor="rating">Βαθμολογία</label>
        <select id="rating" name="rating" defaultValue={existing?.rating ?? 5} required>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} / 5
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="note">Σχόλιο (προαιρετικό)</label>
        <textarea id="note" name="note" rows={3} defaultValue={existing?.note ?? ""} />
      </div>
      {state.error && <p className="error-msg">{state.error}</p>}
      <button type="submit" className="submit-btn" style={{ width: "auto", padding: "11px 24px" }} disabled={pending}>
        {pending ? "Αποστολή…" : existing ? "Ενημέρωση αξιολόγησης" : "Δημοσίευση αξιολόγησης"}
      </button>
    </form>
  );
}
