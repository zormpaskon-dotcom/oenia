import { Appellation, ContentStatus, WineColor, WineStyle } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  const winery = await prisma.winery.findUniqueOrThrow({ where: { slug: "pavlidis-estate" } });
  const drama = await prisma.region.findUniqueOrThrow({ where: { slug: "drama" } });
  const agiorgitiko = await prisma.variety.findUniqueOrThrow({ where: { slug: "agiorgitiko" } });
  const syrah = await prisma.variety.findUniqueOrThrow({ where: { slug: "syrah" } });

  const wine = await prisma.wine.upsert({
    where: { slug: "pavlidis-thema-erythro" },
    update: {
      name: "Thema Ερυθρό",
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      regionId: drama.id,
      description: "Η συνύπαρξη του Αγιωργίτικου με το Syrah — πρωτοποριακό χαρμάνι για την περιοχή, από αμπέλια στις πλαγιές του Μενοικίου όρους σε υψόμετρο περίπου 400m.",
      tastingNotes: "Βαθύ ρουμπινί χρώμα με μωβ ανταύγειες. Μικρά κόκκινα φρούτα με απαλές νότες φρυγανισμένου ψωμιού και βανίλιας. Γεμάτο, λιπαρό στόμα με ικανοποιητική φρεσκάδα, ώριμες και καλά αφομοιωμένες τανίνες. Φρουτώδης επίγευση διαρκείας με υπερώριμα φρούτα και κανέλα.",
      vineyardNotes: "Αγιωργίτικο και Syrah φυτεμένα στις πλαγιές του όρους Μενοίκιο, σε υψόμετρο περίπου 400m, στη Δράμα.",
      winemakingNotes: "Παραμένει περίπου έναν χρόνο σε δρύινα γαλλικά βαρέλια και μισό χρόνο στη φιάλη.",
      status: ContentStatus.PUBLISHED,
    },
    create: {
      slug: "pavlidis-thema-erythro",
      name: "Thema Ερυθρό",
      wineryId: winery.id,
      regionId: drama.id,
      color: WineColor.RED,
      style: WineStyle.DRY,
      appellation: Appellation.PGI,
      description: "Η συνύπαρξη του Αγιωργίτικου με το Syrah — πρωτοποριακό χαρμάνι για την περιοχή, από αμπέλια στις πλαγιές του Μενοικίου όρους σε υψόμετρο περίπου 400m.",
      tastingNotes: "Βαθύ ρουμπινί χρώμα με μωβ ανταύγειες. Μικρά κόκκινα φρούτα με απαλές νότες φρυγανισμένου ψωμιού και βανίλιας. Γεμάτο, λιπαρό στόμα με ικανοποιητική φρεσκάδα, ώριμες και καλά αφομοιωμένες τανίνες. Φρουτώδης επίγευση διαρκείας με υπερώριμα φρούτα και κανέλα.",
      vineyardNotes: "Αγιωργίτικο και Syrah φυτεμένα στις πλαγιές του όρους Μενοίκιο, σε υψόμετρο περίπου 400m, στη Δράμα.",
      winemakingNotes: "Παραμένει περίπου έναν χρόνο σε δρύινα γαλλικά βαρέλια και μισό χρόνο στη φιάλη.",
      foodPairings: [],
      status: ContentStatus.PUBLISHED,
    },
  });
  await prisma.varietyOnWine.deleteMany({ where: { wineId: wine.id } });
  await prisma.varietyOnWine.createMany({
    data: [
      { wineId: wine.id, varietyId: agiorgitiko.id, percentage: null },
      { wineId: wine.id, varietyId: syrah.id, percentage: null },
    ],
  });
  console.log("✓ pavlidis-thema-erythro");
}
main().finally(() => prisma.$disconnect());
