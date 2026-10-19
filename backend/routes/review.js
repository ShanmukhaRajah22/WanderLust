import express from "express";
const router = express.Router({ mergeParams: true });
import wrapAsync from "../utils/wrapAsync.js";
import { validateReview, isLoggedIn, isReviewAuthor } from "../middleware.js";
import * as reviewController from "../controllers/reviews.js";


// CREATE REVIEW
router.post("/",isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// DELETE REVIEW
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview));


export default router;
