"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";

export type MapWinery = {
  slug: string;
  name: string;
  regionName: string;
  regionSlug: string;
  lat: number;
  lng: number;
  wineCount: number;
};

export default function WineMap({ wineries }: { wineries: MapWinery[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;

      map = L.map(containerRef.current, {
        center: [38.5, 23.5],
        zoom: 6,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> συνεισφέροντες',
        maxZoom: 18,
      }).addTo(map);

      const icon = L.divIcon({
        className: "wine-map-pin",
        html: '<span></span>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      for (const w of wineries) {
        const marker = L.marker([w.lat, w.lng], { icon }).addTo(map);
        const popupEl = document.createElement("div");
        popupEl.className = "wine-map-popup";
        popupEl.innerHTML = `
          <strong>${w.name}</strong>
          <span>${w.regionName} · ${w.wineCount} ${w.wineCount === 1 ? "ετικέτα" : "ετικέτες"}</span>
        `;
        const link = document.createElement("a");
        link.href = `/oinopoieia/${w.slug}`;
        link.textContent = "Δες το προφίλ";
        link.className = "wine-map-popup-link";
        link.addEventListener("click", (e) => {
          e.preventDefault();
          router.push(`/oinopoieia/${w.slug}`);
        });
        popupEl.appendChild(link);
        marker.bindPopup(popupEl);
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [wineries, router]);

  return <div ref={containerRef} className="wine-map" />;
}
