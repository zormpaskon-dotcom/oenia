"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const INTERVAL_MS = 5500;

/** Crossfade + Ken Burns φωτογραφιών για το hero της αρχικής — δεν είναι video, αλλά δίνει την ίδια αίσθηση. */
export default function HeroSlideshow({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => {
      setActive((i) => (i + 1) % images.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <>
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          quality={95}
          priority={i === 0}
          className={i === active ? "is-active" : ""}
          style={{ objectFit: "cover", objectPosition: "center 42%" }}
        />
      ))}
    </>
  );
}
