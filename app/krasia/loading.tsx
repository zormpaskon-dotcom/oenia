// Next.js App Router automatic loading UI — δεν υπήρχε loading.tsx πουθενά
// στο site πριν, οπότε φτιάχνουμε διακριτικά skeleton cards αντί για spinner,
// στο ίδιο grid layout με τα πραγματικά WineCard (.wine-grid, βλ. globals.css).
export default function KrasiaLoading() {
  return (
    <>
      <div className="wrap-wide krasia-intro">
        <p className="kicker">ΕΞΕΡΕΥΝΗΣΗ</p>
        <h1>Όλες οι ετικέτες</h1>
        <div className="skeleton-line" style={{ width: 120, height: 14, marginTop: 12 }} />
      </div>

      <div className="wrap-wide krasia-toolbar">
        <div className="skeleton-line" style={{ width: 96, height: 38, borderRadius: "var(--radius)" }} />
        <div className="skeleton-line" style={{ width: 160, height: 38, borderRadius: "var(--radius)" }} />
      </div>

      <div className="wrap-wide">
        <div className="wine-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div className="wine-card-skeleton" key={i}>
              <div className="skeleton-block" style={{ aspectRatio: "3/2" }} />
              <div className="skeleton-line" style={{ width: "70%", height: 14, marginTop: 14 }} />
              <div className="skeleton-line" style={{ width: "45%", height: 12, marginTop: 8 }} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
