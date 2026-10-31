import "./ListingCard.css";

const fmt = (n) => "₹ " + Number(n).toLocaleString("en-IN");

export default function ListingCard({ listing, onClick, style }) {
  return (
    <article
      className="lcard"
      style={style}
      onClick={() => onClick(listing._id)}
    >
      <div className="lcard__img-wrap">
        {listing.image?.url ? (
          <img src={listing.image.url} alt={listing.title} loading="lazy" />
        ) : (
          <div className="lcard__img-empty">🏠</div>
        )}
        <div className="lcard__img-fade" />
      </div>
      <div className="lcard__body">
        <h3 className="lcard__title">{listing.title}</h3>
        <p className="lcard__location">
          📍 {listing.location}, {listing.country}
        </p>
        {listing.amenities?.length > 0 && (
          <div className="lcard__amenities">
            {listing.amenities.slice(0, 3).map((amenity) => (
              <span key={amenity}>{amenity}</span>
            ))}
          </div>
        )}
        <div className="lcard__footer">
          <span className="lcard__price">{fmt(listing.price)}</span>
          <span className="lcard__night">/ night</span>
        </div>
      </div>
    </article>
  );
}
