// Adaptive image section for premium winery profiles — δεν υποθέτει ποτέ
// σταθερό αριθμό εικόνων ΟΥΤΕ σταθερή αναλογία. Ανάλογα με το πόσες
// πραγματικές εικόνες δίνονται (1 έως 4+), αλλάζει layout: 1 = μεγάλη
// editorial εικόνα, 2 = ισορροπημένο δίστηλο, 3 = editorial grid (μία
// μεγάλη + δύο μικρότερες), 4+ = πλήρες gallery grid. Δεν δείχνει ποτέ
// placeholder για εικόνα που δεν υπάρχει.
//
// Για την περίπτωση 1 εικόνας (η πιο συχνή — Place/Winery/Editorial), το
// ύψος του "bleed" δεν είναι ποτέ fixed: υπολογίζεται από την πραγματική
// αναλογία διαστάσεων της εικόνας (bucketFor), ώστε ένα panoramic να μη
// γίνεται αφύσικα ψηλό και ένα portrait να μην κόβεται άσχημα. Το `size`
// prop ("large"/"quiet") δίνει ρυθμική ποικιλία σε σελίδες με πολλά
// διαδοχικά bleed sections, χωρίς να αλλάζει τη λογική προσαρμογής.
// Το `layout="split"` δίνει μια δεύτερη, contained εναλλακτική (εικόνα +
// τίτλος δίπλα-δίπλα, ίδιο μοτίβο με το υπάρχον .wine-split) για ρυθμό.

type VisualImage = { src: string; alt: string; width?: number; height?: number };

type Bucket = "panoramic" | "wide" | "standard" | "portrait";

function bucketFor(width?: number, height?: number): Bucket {
  if (!width || !height) return "standard";
  const ratio = width / height;
  if (ratio >= 2.4) return "panoramic";
  if (ratio >= 1.75) return "wide";
  if (ratio >= 0.85) return "standard";
  return "portrait";
}

const BLEED_HEIGHT: Record<Bucket, { large: string; quiet: string }> = {
  panoramic: { large: "clamp(220px,26vw,380px)", quiet: "clamp(180px,20vw,280px)" },
  wide: { large: "clamp(300px,40vw,520px)", quiet: "clamp(220px,28vw,360px)" },
  standard: { large: "clamp(360px,54vw,640px)", quiet: "clamp(240px,32vw,400px)" },
  portrait: { large: "clamp(420px,58vw,680px)", quiet: "clamp(320px,40vw,480px)" },
};

export default function WineryVisualSection({
  id,
  images,
  eyebrow,
  title,
  text,
  background,
  layout = "bleed",
  size = "large",
}: {
  id?: string;
  images: VisualImage[];
  eyebrow?: string;
  title?: string;
  text?: string;
  background?: "alt";
  /** "split" = contained εικόνα δίπλα σε κείμενο (μόνο για 1 εικόνα). */
  layout?: "bleed" | "split";
  /** "quiet" = πιο ήσυχο, χαμηλότερο treatment — για ρυθμική ποικιλία. */
  size?: "large" | "quiet";
}) {
  if (images.length === 0) return null;
  const sectionStyle = background === "alt" ? { background: "var(--paper-alt)" } : undefined;
  const copy = (eyebrow || title || text) && (
    <>
      {eyebrow && <p className="wine-split-eyebrow">{eyebrow}</p>}
      {title && <h2 className="wprofile-visual-title">{title}</h2>}
      {text && <p className="wprofile-visual-text">{text}</p>}
    </>
  );

  if (images.length === 1 && layout === "split") {
    const img = images[0];
    return (
      <section id={id} style={sectionStyle}>
        <div className="wrap">
          <div className="wprofile-split">
            <div className="wprofile-split-copy reveal home-reveal">{copy}</div>
            <div className="wprofile-split-photo">
              <img className="reveal img-reveal" src={img.src} alt={img.alt} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (images.length === 1) {
    const img = images[0];
    const bucket = bucketFor(img.width, img.height);
    return (
      <section id={id} style={sectionStyle}>
        {copy && (
          <div className="wrap">
            <div className="wprofile-visual-copy reveal home-reveal">{copy}</div>
          </div>
        )}
        {bucket === "portrait" ? (
          <div className="wprofile-tall">
            <img className="reveal img-reveal" src={img.src} alt={img.alt} />
          </div>
        ) : (
          <div className="wprofile-bleed" style={{ height: BLEED_HEIGHT[bucket][size] }}>
            <img className="reveal img-reveal" src={img.src} alt={img.alt} />
          </div>
        )}
      </section>
    );
  }

  return (
    <section id={id} style={sectionStyle}>
      {copy && (
        <div className="wrap">
          <div className="wprofile-visual-copy reveal home-reveal">{copy}</div>
        </div>
      )}

      {images.length === 2 && (
        <div className="wrap">
          <div className="wprofile-pair">
            {images.map((img) => (
              <div className="wprofile-pair-photo" key={img.src}>
                <img className="reveal img-reveal" src={img.src} alt={img.alt} />
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 3 && (
        <div className="wrap">
          <div className="wprofile-trio">
            <div className="wprofile-trio-main">
              <img className="reveal img-reveal" src={images[0].src} alt={images[0].alt} />
            </div>
            <div className="wprofile-trio-side">
              {images.slice(1).map((img) => (
                <div className="wprofile-trio-side-photo" key={img.src}>
                  <img className="reveal img-reveal" src={img.src} alt={img.alt} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {images.length >= 4 && (
        <div className="wrap">
          <div className="wprofile-grid">
            {images.map((img) => (
              <div className="wprofile-grid-photo" key={img.src}>
                <img className="reveal img-reveal" src={img.src} alt={img.alt} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
