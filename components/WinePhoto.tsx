import Image from "next/image";
import type { WineColor } from "@prisma/client";
import { COLOR_GRADIENT } from "@/lib/labels";

/** Πραγματική φωτογραφία ετικέτας αν υπάρχει, αλλιώς gradient placeholder ανά χρώμα κρασιού. */
export default function WinePhoto({
  labelImage,
  color,
  wineName,
  className,
  sizes,
}: {
  labelImage: string | null;
  color: WineColor;
  wineName: string;
  className: string;
  sizes?: string;
}) {
  if (!labelImage) {
    return <div className={className} style={{ background: COLOR_GRADIENT[color] }} />;
  }
  return (
    <div className={className} style={{ position: "relative", overflow: "hidden" }}>
      <Image src={labelImage} alt={wineName} fill sizes={sizes ?? "200px"} style={{ objectFit: "contain" }} />
    </div>
  );
}
