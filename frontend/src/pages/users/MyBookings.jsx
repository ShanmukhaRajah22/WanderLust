import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { api } from "../../utils/api";
import PageLoader from "../../components/ui/page-loader";
import "./MyBookings.css";

const date = (value) => new Date(value).toLocaleDateString("en-IN");

export default function MyBookings({ onNavigate }) {
  const { showFlash } = useApp();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const loadBookings = () => {
    api
      .getMyBookings()
      .then(setBookings)
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const cancel = async (booking) => {
    setCancelling(booking._id);
    try {
      await api.deleteBooking(booking.listing._id, booking._id);
      setBookings((current) =>
        current.filter((item) => item._id !== booking._id),
      );
      showFlash("Booking cancelled.");
    } catch (error) {
      showFlash(error.message || "Could not cancel booking.", "error");
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return <PageLoader text="Loading your bookings" />;
  }

  return (
    <div className="my-bookings container-narrow anim-fade-up">
      <button
        className="btn btn-ghost btn-sm my-bookings__back"
        onClick={() => onNavigate("home")}
      >
        &larr; Back to listings
      </button>
      <span className="my-bookings__eyebrow">Your travel plans</span>
      <h1>My bookings</h1>
      <p className="my-bookings__intro">
        Keep track of your confirmed stays in one place.
      </p>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">&#127968;</div>
          <p className="empty-state__text">You do not have any bookings yet.</p>
          <button className="btn btn-dark" onClick={() => onNavigate("home")}>
            Explore stays
          </button>
        </div>
      ) : (
        <div className="my-bookings__list">
          {bookings.map((booking) => (
            <article className="my-booking" key={booking._id}>
              <div className="my-booking__image">
                {booking.listing?.image?.url ? (
                  <img src={booking.listing.image.url} alt="" />
                ) : (
                  "🏠"
                )}
              </div>
              <div className="my-booking__content">
                <button
                  className="my-booking__title"
                  onClick={() => onNavigate("show", booking.listing._id)}
                >
                  {booking.listing?.title || "Listing"}
                </button>
                <p>
                  {booking.listing?.location}, {booking.listing?.country}
                </p>
                <div className="my-booking__dates">
                  <span>Check-in<strong>{date(booking.checkIn)}</strong></span>
                  <span>Check-out<strong>{date(booking.checkOut)}</strong></span>
                </div>
              </div>
              <button
                className="btn btn-outline btn-sm my-booking__cancel"
                onClick={() => cancel(booking)}
                disabled={cancelling === booking._id}
              >
                {cancelling === booking._id ? "Canceling..." : "Cancel booking"}
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
