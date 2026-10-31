import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import confetti from "canvas-confetti";
import { useApp } from "../../context/AppContext";
import { api } from "../../utils/api";
import DateRangePicker from "../../components/ui/date-range-picker";
import { TrashIcon } from "../../components/ui/icon-button";

const nightsBetween = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  return Math.round(
    (new Date(`${checkOut}T00:00:00Z`) -
      new Date(`${checkIn}T00:00:00Z`)) /
      86400000,
  );
};

function BookingSuccess({ booking, listing, onClose }) {
  useEffect(() => {
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.55 },
      colors: ["#c0522a", "#e7a24d", "#287a45", "#1a1612"],
    });
  }, []);

  return (
    <div className="booking-success" role="dialog" aria-modal="true">
      <div className="booking-success__card">
        <div className="booking-success__icon">🎉</div>
        <p className="booking-success__eyebrow">Reservation confirmed</p>
        <h2>Your stay is booked!</h2>
        <p className="booking-success__text">
          We saved your reservation at <strong>{listing.title}</strong>.
        </p>
        <div className="booking-success__dates">
          <div>
            <span>Check-in</span>
            <strong>{new Date(`${booking.checkIn}T00:00:00`).toLocaleDateString()}</strong>
          </div>
          <div>
            <span>Check-out</span>
            <strong>{new Date(`${booking.checkOut}T00:00:00`).toLocaleDateString()}</strong>
          </div>
        </div>
        <p className="booking-success__note">
          Enjoy your trip. No payment is required for this demo booking.
        </p>
        <button className="btn btn-dark" onClick={onClose}>
          Continue exploring
        </button>
      </div>
    </div>
  );
}

function BookingCancelled({ booking, listing, onClose }) {
  return (
    <div className="booking-success" role="dialog" aria-modal="true">
      <div className="booking-success__card">
        <div className="booking-success__icon">✓</div>
        <p className="booking-success__eyebrow">Reservation cancelled</p>
        <h2>Booking removed</h2>
        <p className="booking-success__text">
          Your reservation at <strong>{listing.title}</strong> was cancelled
          successfully.
        </p>
        <div className="booking-success__dates">
          <div>
            <span>Check-in</span>
            <strong>{new Date(`${booking.checkIn}T00:00:00`).toLocaleDateString()}</strong>
          </div>
          <div>
            <span>Check-out</span>
            <strong>{new Date(`${booking.checkOut}T00:00:00`).toLocaleDateString()}</strong>
          </div>
        </div>
        <p className="booking-success__note">
          Those dates are available to book again.
        </p>
        <button className="btn btn-dark" onClick={onClose}>
          Continue exploring
        </button>
      </div>
    </div>
  );
}

export default function BookingForm({ listing, onNavigate }) {
  const { currentUser, showFlash } = useApp();
  const [dates, setDates] = useState({ checkIn: "", checkOut: "" });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [cancelledBooking, setCancelledBooking] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const roomOptions = listing.roomInventory?.length
    ? listing.roomInventory
    : [{ roomType: listing.roomType || "Private room", totalRooms: 1 }];
  const [roomType, setRoomType] = useState(roomOptions[0].roomType);

  const loadBookings = useCallback(
    () =>
      api
        .getBookings(listing._id)
        .then(setBookings)
        .catch(() => setBookings([])),
    [listing._id],
  );

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const nights = nightsBetween(dates.checkIn, dates.checkOut);
  const total = useMemo(
    () => nights * Number(listing.price || 0),
    [nights, listing.price],
  );

  const submit = async (event) => {
    event.preventDefault();
    if (!currentUser) {
      onNavigate("login");
      return;
    }
    if (!nights) {
      showFlash("Choose a valid check-in and check-out date.", "error");
      return;
    }

    setLoading(true);
    try {
      await api.createBooking(listing._id, { booking: { ...dates, roomType } });
      showFlash("Booking confirmed!");
      setConfirmedBooking(dates);
      setDates({ checkIn: "", checkOut: "" });
      await loadBookings();
    } catch (error) {
      showFlash(error.message || "Could not create booking.", "error");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    setDeletingId(bookingId);
    try {
      await api.deleteBooking(listing._id, bookingId);
      const message = "Your booking was cancelled and removed.";
      showFlash(message);
      setCancelledBooking(
        bookings.find((booking) => booking._id === bookingId),
      );
      await loadBookings();
    } catch (error) {
      showFlash(error.message || "Could not cancel booking.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <section className="booking-card">
      <div className="booking-card__heading">
        <div>
          <h2>Reserve this stay</h2>
          <p>Select your dates to check availability.</p>
        </div>
        <strong>₹ {Number(listing.price).toLocaleString("en-IN")} / night</strong>
      </div>

      <form onSubmit={submit}>
        <DateRangePicker value={dates} onChange={setDates} />
        {roomOptions.length > 1 && (
          <label className="form-group">
            <span className="form-label">Room type</span>
            <select
              className="form-input"
              value={roomType}
              onChange={(event) => setRoomType(event.target.value)}
            >
              {roomOptions.map((room) => (
                <option key={room.roomType} value={room.roomType}>
                  {room.roomType} ({room.totalRooms} rooms)
                </option>
              ))}
            </select>
          </label>
        )}

        {nights > 0 && (
          <div className="booking-card__summary">
            <span>
              {nights} night{nights !== 1 ? "s" : ""}
            </span>
            <strong>₹ {total.toLocaleString("en-IN")}</strong>
          </div>
        )}

        <button className="btn btn-dark booking-card__button" disabled={loading}>
          {loading ? "Booking…" : currentUser ? "Reserve now" : "Login to reserve"}
        </button>
      </form>

      {bookings.length > 0 && (
        <div className="booking-card__booked">
          <strong>Booked dates</strong>
          {bookings.map((booking) => (
            <div className="booking-card__booked-row" key={booking._id}>
              <span>
                {new Date(booking.checkIn).toLocaleDateString()} –{" "}
                {new Date(booking.checkOut).toLocaleDateString()}
                {booking.roomType ? ` · ${booking.roomType}` : ""}
              </span>
              {booking.isMine && (
                <button
                  type="button"
                  className="booking-card__cancel"
                  onClick={() => cancelBooking(booking._id)}
                  disabled={deletingId === booking._id}
                >
                  <TrashIcon size={15} />
                  <span>{deletingId === booking._id ? "Canceling…" : "Cancel"}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      </section>
      {confirmedBooking &&
        createPortal(
          <BookingSuccess
            booking={confirmedBooking}
            listing={listing}
            onClose={() => setConfirmedBooking(null)}
          />,
          document.body,
        )}
      {cancelledBooking &&
        createPortal(
          <BookingCancelled
            booking={cancelledBooking}
            listing={listing}
            onClose={() => setCancelledBooking(null)}
          />,
          document.body,
        )}
    </>
  );
}
