"use client";

import { useActionState } from "react";
import { ArticleCategory, ContentStatus } from "@prisma/client";
import { createArticleAction, updateArticleAction, type ArticleFormState } from "@/app/admin/arthra/actions";
import { CATEGORY_LABEL } from "@/lib/labels";

const initialState: ArticleFormState = { error: null };

export type EditableArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  category: ArticleCategory;
  regionId: string | null;
  readMinutes: number | null;
  tags: string[];
  isSponsored: boolean;
  sponsorName: string | null;
  coverImage: string | null;
  status: ContentStatus;
};

export default function ArticleForm({
  article,
  regions,
}: {
  article?: EditableArticle;
  regions: { id: string; name: string }[];
}) {
  const action = article ? updateArticleAction : createArticleAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} style={{ maxWidth: 640 }}>
      {article && <input type="hidden" name="id" value={article.id} />}

      <div className="field">
        <label htmlFor="title">Τίτλος *</label>
        <input type="text" id="title" name="title" required defaultValue={article?.title} />
      </div>

      <div className="field">
        <label htmlFor="slug">Slug (προαιρετικό — παράγεται από τον τίτλο αν το αφήσεις κενό)</label>
        <input type="text" id="slug" name="slug" defaultValue={article?.slug} />
      </div>

      <div className="field">
        <label htmlFor="category">Κατηγορία *</label>
        <select id="category" name="category" required defaultValue={article?.category ?? ""}>
          <option value="" disabled>
            Διάλεξε κατηγορία…
          </option>
          {Object.values(ArticleCategory).map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="regionId">Περιοχή (προαιρετικό)</label>
        <select id="regionId" name="regionId" defaultValue={article?.regionId ?? ""}>
          <option value="">— καμία —</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="excerpt">Περίληψη</label>
        <textarea id="excerpt" name="excerpt" rows={2} defaultValue={article?.excerpt ?? ""} />
      </div>

      <div className="field">
        <label htmlFor="body">Κείμενο άρθρου * (κενή γραμμή = νέα παράγραφος)</label>
        <textarea id="body" name="body" rows={12} required defaultValue={article?.body} />
      </div>

      <div className="field">
        <label htmlFor="coverImage">
          Εικόνα εξωφύλλου {article?.coverImage ? "(θα αντικατασταθεί αν ανεβάσεις νέα)" : "(προαιρετικό)"} —
          έως 5MB, JPEG/PNG/WebP
        </label>
        <input type="file" id="coverImage" name="coverImage" accept="image/jpeg,image/png,image/webp" />
      </div>

      <div className="field">
        <label htmlFor="readMinutes">Λεπτά ανάγνωσης</label>
        <input type="number" id="readMinutes" name="readMinutes" min={1} defaultValue={article?.readMinutes ?? undefined} />
      </div>

      <div className="field">
        <label htmlFor="tags">Ετικέτες (χωρισμένες με κόμμα)</label>
        <input type="text" id="tags" name="tags" defaultValue={article?.tags.join(", ") ?? ""} />
      </div>

      <div className="toggle-row" style={{ padding: "10px 0" }}>
        <span className="label-text">Sponsored περιεχόμενο;</span>
        <label className="switch">
          <input type="checkbox" name="isSponsored" defaultChecked={article?.isSponsored} />
          <span className="slider" />
        </label>
      </div>

      <div className="field">
        <label htmlFor="sponsorName">Όνομα χορηγού (αν είναι sponsored)</label>
        <input type="text" id="sponsorName" name="sponsorName" defaultValue={article?.sponsorName ?? ""} />
      </div>

      <div className="toggle-row" style={{ padding: "10px 0", borderBottom: "none" }}>
        <span className="label-text">Δημοσίευση τώρα</span>
        <label className="switch">
          <input
            type="checkbox"
            name="publishNow"
            defaultChecked={article ? article.status === ContentStatus.PUBLISHED : true}
          />
          <span className="slider" />
        </label>
      </div>

      {state.error && (
        <span className="error-msg" style={{ display: "block", margin: "16px 0" }}>
          {state.error}
        </span>
      )}

      <button type="submit" className="submit-btn" disabled={pending} style={{ marginTop: 16, width: "auto", padding: "11px 24px" }}>
        {pending ? "Αποθήκευση…" : article ? "Ενημέρωση άρθρου" : "Δημιουργία άρθρου"}
      </button>
    </form>
  );
}
