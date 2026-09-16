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

    // Κάθε observeAll() (αρχικό + κάθε mutation) περνάει από rAF αντί να τρέχει
    // synchronously: σε βαρύτερες σελίδες (π.χ. /krasia) το React hydration
    // αφαιρεί Suspense-boundary markers ως DOM mutations — αν ο MutationObserver
    // απαντήσει synchronously, το IntersectionObserver προλαβαίνει να γράψει
    // is-visible πριν ολοκληρωθεί το hydration του δέντρου, προκαλώντας ψευδές
    // hydration-mismatch warning. Ένα frame καθυστέρηση δεν αλλάζει το animation.
    let raf = 0;
    function scheduleObserveAll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(observeAll);
    }

    scheduleObserveAll();

    // Καλύπτει στοιχεία που μπαίνουν αργότερα στο DOM (client-side πλοήγηση, φίλτρα).
    const mutationObserver = new MutationObserver(() => scheduleObserveAll());
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
