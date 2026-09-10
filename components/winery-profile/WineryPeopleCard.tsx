// Προαιρετικό, μικρό People section — εμφανίζεται μόνο όταν υπάρχει
// επιβεβαιωμένη φωτογραφία ανθρώπου. Δεν γράφει νέο βιογραφικό κείμενο:
// το caption είναι πάντα ήδη-εγκεκριμένο κείμενο (π.χ. η υπάρχουσα περιγραφή
// του οινοποιείου), όχι κάτι που φτιάχτηκε γι' αυτό το component.

export default function WineryPeopleCard({
  photoSrc,
  photoAlt,
  name,
  caption,
}: {
  photoSrc: string | null;
  photoAlt: string;
  name: string;
  caption?: string;
}) {
  if (!photoSrc) return null;

  return (
    <section id="people">
      <div className="wrap">
        <p className="wine-split-eyebrow">Οι άνθρωποι</p>
        <div className="wprofile-people reveal home-reveal">
          <div className="wprofile-people-photo">
            <img className="reveal img-reveal" src={photoSrc} alt={photoAlt} />
          </div>
          <div className="wprofile-people-copy">
            <h3 className="wprofile-people-name">{name}</h3>
            {caption && <p>{caption}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
