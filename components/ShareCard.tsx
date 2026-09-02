"use client";

import { useRef, useState } from "react";

export type ShareCardData = {
  name: string;
  winery: string;
  region: string;
  variety: string;
  rating: string;
};

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  const lines: string[] = [];
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line !== "") {
      lines.push(line);
      line = word + " ";
    } else {
      line = test;
    }
  }
  lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l.trim(), x, y + i * lineHeight));
}

function getFontStacks() {
  const style = getComputedStyle(document.documentElement);
  const fraunces = style.getPropertyValue("--font-fraunces").trim() || "serif";
  const inter = style.getPropertyValue("--font-inter").trim() || "sans-serif";
  const alexBrush = style.getPropertyValue("--font-alex-brush").trim() || "cursive";
  return { fraunces, inter, alexBrush };
}

function drawCard(canvas: HTMLCanvasElement, card: ShareCardData) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { fraunces, inter, alexBrush } = getFontStacks();
  const w = canvas.width;
  const h = canvas.height;

  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#4A2117");
  grad.addColorStop(1, "#2A1109");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(250,246,239,0.25)";
  ctx.lineWidth = 1;
  ctx.strokeRect(24, 24, w - 48, h - 48);

  ctx.textAlign = "center";

  ctx.fillStyle = "#FDFBF7";
  ctx.font = `54px ${alexBrush}`;
  ctx.fillText("oenia", w / 2, 130);

  ctx.fillStyle = "#C99A4F";
  ctx.font = `600 20px ${inter}`;
  ctx.fillText(`${card.region} · ${card.variety}`.toUpperCase(), w / 2, 210);

  ctx.fillStyle = "#FDFBF7";
  ctx.font = `500 46px ${fraunces}`;
  wrapText(ctx, card.name, w / 2, 300, w - 140, 54);

  ctx.fillStyle = "rgba(250,246,239,0.7)";
  ctx.font = `22px ${inter}`;
  ctx.fillText(card.winery, w / 2, 420);

  const cx = w / 2;
  const cy = 560;
  const r = 70;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(250,246,239,0.08)";
  ctx.fill();
  ctx.strokeStyle = "rgba(250,246,239,0.4)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#FDFBF7";
  ctx.font = `600 42px ${fraunces}`;
  ctx.fillText(card.rating, cx, cy + 15);

  ctx.fillStyle = "rgba(250,246,239,0.6)";
  ctx.font = `16px ${inter}`;
  ctx.fillText("βαθμολογία χρηστών", cx, cy + 100);

  ctx.fillStyle = "rgba(250,246,239,0.55)";
  ctx.font = `16px ${inter}`;
  ctx.fillText("oenia.gr — ελληνικό κρασί, χωρίς πωλήσεις", w / 2, h - 60);
}

export default function ShareCard({ data }: { data: ShareCardData }) {
  const [isOpen, setIsOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  async function openShare() {
    setIsOpen(true);
    const { fraunces, inter, alexBrush } = getFontStacks();
    try {
      await Promise.all([
        document.fonts.load(`54px ${alexBrush}`),
        document.fonts.load(`500 46px ${fraunces}`),
        document.fonts.load(`600 42px ${fraunces}`),
        document.fonts.load(`16px ${inter}`),
        document.fonts.load(`600 20px ${inter}`),
      ]);
    } finally {
      if (canvasRef.current) drawCard(canvasRef.current, data);
    }
  }

  function downloadPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `oenia-${data.name.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <>
      <button className="share-btn" type="button" onClick={openShare}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.6" y1="10.6" x2="15.4" y2="6.4" />
          <line x1="8.6" y1="13.4" x2="15.4" y2="17.6" />
        </svg>
        Μοιράσου
      </button>

      {isOpen && (
        <div
          className="share-overlay is-open"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div className="share-modal">
            <h3>Η κάρτα σου είναι έτοιμη</h3>
            <canvas ref={canvasRef} id="shareCanvas" width={600} height={1000} />
            <div className="share-actions">
              <button className="close-btn" type="button" onClick={() => setIsOpen(false)}>
                Κλείσιμο
              </button>
              <button className="download-btn" type="button" onClick={downloadPng}>
                Κατέβασμα PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
