import { CellarStatus } from "@prisma/client";
import { setCellarStatusAction } from "@/lib/actions/cellar";

export default function CellarButtons({
  wineId,
  wineSlug,
  currentStatus,
}: {
  wineId: string;
  wineSlug: string;
  currentStatus: CellarStatus | null;
}) {
  return (
    <div className="cellar-actions">
      <form action={setCellarStatusAction}>
        <input type="hidden" name="wineId" value={wineId} />
        <input type="hidden" name="wineSlug" value={wineSlug} />
        <input
          type="hidden"
          name="status"
          value={currentStatus === CellarStatus.WANT_TO_TRY ? "NONE" : CellarStatus.WANT_TO_TRY}
        />
        <button type="submit" className={`cellar-btn${currentStatus === CellarStatus.WANT_TO_TRY ? " is-on" : ""}`}>
          Θέλω να δοκιμάσω
        </button>
      </form>
      <form action={setCellarStatusAction}>
        <input type="hidden" name="wineId" value={wineId} />
        <input type="hidden" name="wineSlug" value={wineSlug} />
        <input
          type="hidden"
          name="status"
          value={currentStatus === CellarStatus.TRIED ? "NONE" : CellarStatus.TRIED}
        />
        <button type="submit" className={`cellar-btn${currentStatus === CellarStatus.TRIED ? " is-on" : ""}`}>
          Το δοκίμασα
        </button>
      </form>
    </div>
  );
}
