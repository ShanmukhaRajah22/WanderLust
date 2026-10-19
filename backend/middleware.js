import Listing from "./models/listing.js";
import ExpressError from "./utils/ExpressError.js";
import Review from "./models/review.js";
import { listingSchema, reviewSchema } from "./schema.js";
import mongoose from "mongoose";


export const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be signed in to perform actions!" });
    }
    next();
}

export const saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        // delete req.session.redirectUrl;
    }
    next();
}

export const isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("owner");
    if (!listing) {
        return res.status(404).json({ message: "Listing not found!" });
    }
    if (!listing.owner._id.equals(req.user._id)) {
        return res.status(403).json({ message: "You are not the owner of this listing!" });
    }
    next();
}

export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Convert flat FormData keys like "listing[title]" into nested { listing: { title } }
export const parseFormData = (req, res, next) => {
    if (req.is("multipart/form-data") && !req.body.listing) {
        const nested = {};
        for (const key of Object.keys(req.body)) {
            const match = key.match(/^(\w+)\[(\w+)\]$/);
            if (match) {
                const [, outer, inner] = match;
                if (!nested[outer]) nested[outer] = {};
                nested[outer][inner] = req.body[key];
            } else {
                nested[key] = req.body[key];
            }
        }
        req.body = nested;
    }
    next();
};


export const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error.details[0].message);
    }
    next();
};

export const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error.details[0].message);
    }
    next();
};

export const isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review) {
        return res.status(404).json({ message: "Review not found!" });
    }
    if (!review.author.equals(req.user._id)) {
        return res.status(403).json({ message: "You are not the author of this review!" });
    }
    next();
}