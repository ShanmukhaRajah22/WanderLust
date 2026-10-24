import express from "express";
import wrapAsync from "../utils/wrapAsync.js";
import { isLoggedIn } from "../middleware.js";
import { listMyBookings } from "../controllers/bookings.js";

const router = express.Router();

router.get("/me", isLoggedIn, wrapAsync(listMyBookings));

export default router;
