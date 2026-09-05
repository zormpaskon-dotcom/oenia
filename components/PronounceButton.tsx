"use client";

import { useState } from "react";

/** Διαβάζει δυνατά το ελληνικό όνομα μέσω του Web Speech API του browser (καμία δική μας ηχογράφηση). */
export default function PronounceButton({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);

  function speak() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "el-GR";
    utterance.rate = 0.85;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <button
      type="button"
      className={`pronounce-btn${speaking ? " is-speaking" : ""}`}
      onClick={speak}
      aria-label={`Άκουσε την προφορά της λέξης «${text}»`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="4,9 8,9 12,5 12,19 8,15 4,15" />
        <path d="M15.3 8.5a4.2 4.2 0 0 1 0 7" />
      </svg>
      Προφορά
    </button>
  );
}
