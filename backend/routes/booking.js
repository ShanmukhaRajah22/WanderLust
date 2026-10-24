import express from "express";
import wrapAsync from "../utils/wrapAsync.js";
import { isLoggedIn } from "../middleware.js";
import * as bookingController from "../controllers/bookings.js";

const router = express.Router({ mergeParams: true });

router.get("/", wrapAsync(bookingController.listBookings));
router.post("/", isLoggedIn, wrapAsync(bookingController.createBooking));
router.delete(
    "/:bookingId",
    isLoggedIn,
    wrapAsync(bookingController.deleteBooking),
);

export default router;
