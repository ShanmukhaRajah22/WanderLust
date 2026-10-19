import Listing from "../models/listing.js";
import { isValidObjectId } from "mongoose";
import ExpressError from "../utils/ExpressError.js";
import NodeGeocoder from "node-geocoder";

const geocoder = NodeGeocoder({ provider: "openstreetmap" });

const geocodeListing = async (listing) => {
    const address = `${listing.location}, ${listing.country}`;
    const [result] = await geocoder.geocode(address);

    if (result?.latitude == null || result?.longitude == null) {
        throw new ExpressError(400, `Could not find coordinates for "${address}".`);
    }

    listing.geometry = {
        type: "Point",
        coordinates: [result.longitude, result.latitude],
    };
};

// GET /listings
export const index = async (req, res) => {
    const allListings = await Listing.find({});
    res.json(allListings);
};

// GET /listings/new  (kept for legacy, React doesn't use this)
export const renderNewForm = (req, res) => {
    res.json({ message: "Use the React frontend to create a listing." });
};

// GET /listings/:id
export const showListing = async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid listing ID" });
    }

    const listing = await Listing.findById(id)
        .populate("owner")
        .populate({ path: "reviews", populate: { path: "author" } });

    if (!listing) {
        return res.status(404).json({ message: "Listing not found!" });
    }

    res.json(listing);
};

// POST /listings
export const createListing = async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await geocodeListing(newListing);

    if (req.file) {
        newListing.image = {
            url: req.file.secure_url,
            filename: req.file.public_id,
        };
    }

    await newListing.save();
    await newListing.populate("owner");

    res.status(201).json(newListing);
};

// GET /listings/:id/edit  (kept for legacy, React doesn't use this)
export const renderEditForm = async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid listing ID" });
    }

    const listing = await Listing.findById(id);

    if (!listing) {
        return res.status(404).json({ message: "Listing not found!" });
    }

    res.json(listing);
};

// PUT /listings/:id
export const updateListing = async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid listing ID" });
    }

    const listing = await Listing.findById(id);

    if (!listing) {
        return res.status(404).json({ message: "Listing not found!" });
    }

    const locationChanged =
        listing.location !== req.body.listing.location ||
        listing.country !== req.body.listing.country;
    Object.assign(listing, req.body.listing);
    if (locationChanged) {
        await geocodeListing(listing);
    }

    if (req.file) {
        listing.image = {
            url: req.file.secure_url,
            filename: req.file.public_id,
        };
    }

    await listing.save();
    await listing.populate("owner");

    res.json(listing);
};

// DELETE /listings/:id
export const deleteListing = async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({ message: "Invalid listing ID" });
    }

    const listing = await Listing.findByIdAndDelete(id);

    if (!listing) {
        return res.status(404).json({ message: "Listing not found!" });
    }

    res.json({ success: true, message: "Listing deleted successfully!" });
};