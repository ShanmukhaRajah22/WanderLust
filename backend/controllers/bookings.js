import Booking from "../models/booking.js";
import Listing from "../models/listing.js";
import ExpressError from "../utils/ExpressError.js";
import { bookingSchema } from "../schema.js";

export const listBookings = async (req, res) => {
    const listing = await Listing.findById(req.params.id).select("_id");
    if (!listing) {
        return res.status(404).json({ message: "Listing not found!" });
    }

    const bookings = await Booking.find({
        listing: listing._id,
        status: "confirmed",
    })
        .select("checkIn checkOut guest")
        .sort({ checkIn: 1 });

    res.json(
        bookings.map((booking) => ({
            _id: booking._id,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            isMine: req.user
                ? booking.guest.equals(req.user._id)
                : false,
        })),
    );
};

export const createBooking = async (req, res) => {
    const result = bookingSchema.safeParse(req.body);
    if (!result.success) {
        throw new ExpressError(
            400,
            result.error.issues[0]?.message || "Invalid booking dates",
        );
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        return res.status(404).json({ message: "Listing not found!" });
    }

    const { checkIn, checkOut } = result.data.booking;
    const conflictingBooking = await Booking.findOne({
        listing: listing._id,
        status: "confirmed",
        checkIn: { $lt: checkOut },
        checkOut: { $gt: checkIn },
    });

    if (conflictingBooking) {
        return res.status(409).json({
            message: "These dates are already booked. Please choose different dates.",
        });
    }

    const booking = await Booking.create({
        listing: listing._id,
        guest: req.user._id,
        checkIn,
        checkOut,
    });

    res.status(201).json(booking);
};

export const deleteBooking = async (req, res) => {
    const booking = await Booking.findOne({
        _id: req.params.bookingId,
        listing: req.params.id,
        guest: req.user._id,
        status: "confirmed",
    });

    if (!booking) {
        return res.status(404).json({ message: "Booking not found." });
    }

    await booking.deleteOne();
    res.json({ success: true, message: "Booking cancelled successfully." });
};

export const listMyBookings = async (req, res) => {
    const bookings = await Booking.find({
        guest: req.user._id,
        status: "confirmed",
    })
        .populate("listing", "title location country price image")
        .sort({ checkIn: 1 });

    res.json(bookings);
};
