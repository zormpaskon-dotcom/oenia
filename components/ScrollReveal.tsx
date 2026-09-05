"use client";

import { useEffect } from "react";

/** Global scroll-reveal: κάθε στοιχείο με class "reveal" παίρνει "is-visible" όταν μπαίνει στο viewport. */
export default function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    function observeAll() {
      document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => observer.observe(el));
    }

    observeAll();

    // Καλύπτει στοιχεία που μπαίνουν αργότερα στο DOM (client-side πλοήγηση, φίλτρα).
    const mutationObserver = new MutationObserver(() => observeAll());
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
