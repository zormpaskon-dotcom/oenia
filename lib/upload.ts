import { put } from "@vercel/blob";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-80);
}

/**
 * Ανεβάζει μια εικόνα στο Vercel Blob. Επιστρέφει ένα δημόσιο URL, ή ένα
 * μήνυμα σφάλματος κατάλληλο να δειχτεί απευθείας στον χρήστη.
 */
export async function uploadImage(file: File, prefix: string): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: "Η εικόνα πρέπει να είναι JPEG, PNG ή WebP." };
  }
  if (file.size > MAX_SIZE) {
    return { ok: false, error: "Η εικόνα δεν πρέπει να ξεπερνά τα 5MB." };
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { ok: false, error: "Το ανέβασμα εικόνων δεν έχει ρυθμιστεί ακόμα σε αυτό το περιβάλλον." };
  }

  const blob = await put(`${prefix}/${Date.now()}-${sanitizeFilename(file.name)}`, file, {
    access: "public",
  });

  return { ok: true, url: blob.url };
}

/** Διαβάζει ένα προαιρετικό file input από FormData — null αν είναι κενό. */
export function optionalFile(formData: FormData, field: string): File | null {
  const value = formData.get(field);
  return value instanceof File && value.size > 0 ? value : null;
}
