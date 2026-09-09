"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function EntranceScreen() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("oenia_entrance_seen") !== "1") {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function enter() {
    sessionStorage.setItem("oenia_entrance_seen", "1");
    setClosing(true);
    setTimeout(() => setVisible(false), 700);
  }

  return (
    <div className={`entrance-screen${closing ? " is-closing" : ""}`}>
      <Image
        src="/entrance.png"
        alt="Oenia"
        fill
        priority
        sizes="100vw"
        className="entrance-image"
      />
      <button type="button" className="entrance-enter" onClick={enter}>
        ENTER
      </button>
    </div>
  );
}
