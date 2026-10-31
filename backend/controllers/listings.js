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

    const syncPrimaryRoomType = (listing) => {
        if (listing.roomInventory?.length) {
            listing.roomType = listing.roomInventory[0].roomType;
        }
    };
};

// GET /listings
export const index = async (req, res) => {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 12, 1), 24);
    const query = {};
    const search = String(req.query.search || "").trim();
    const location = String(req.query.location || "").trim();
    const country = String(req.query.country || "").trim();
    const amenity = String(req.query.amenity || "").trim();
    const roomType = String(req.query.roomType || "").trim();

    if (search) {
        const expression = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        query.$and = [{
            $or: [{ title: expression }, { description: expression }, { location: expression }, { country: expression }],
        }];
    }
    if (location) query.location = new RegExp(location, "i");
    if (country) query.country = country;
    if (amenity) query.amenities = amenity;
    if (roomType) {
        query.$and = [
            ...(query.$and || []),
            { $or: [{ roomType }, { "roomInventory.roomType": roomType }] },
        ];
    }
    if (req.query.mapOnly === "true") {
        query["geometry.coordinates.1"] = { $exists: true };
    }
    if (req.query.maxPrice) {
        query.price = { $lte: Number(req.query.maxPrice) };
    }

    const sortOptions = {
        priceAsc: { price: 1, _id: 1 },
        priceDesc: { price: -1, _id: 1 },
        title: { title: 1, _id: 1 },
        newest: { _id: -1 },
    };
    const sort = sortOptions[req.query.sort] || sortOptions.priceAsc;
    const [listings, total] = await Promise.all([
        Listing.find(query)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit),
        Listing.countDocuments(query),
    ]);

    res.json({
        listings,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    });
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
    syncPrimaryRoomType(newListing);
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
    syncPrimaryRoomType(listing);
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