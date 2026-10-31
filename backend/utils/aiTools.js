import { tool } from "ai";
import { z } from "zod";
import mongoose from "mongoose";
import Listing from "../models/listing.js";
import Booking from "../models/booking.js";

const searchInput = z.object({
    location: z.string().optional().describe("City or place to search for"),
    country: z.string().optional().describe("Country to search for"),
    keyword: z.string().optional().describe("Word to search in the title or description"),
    maxPrice: z.number().optional().describe("Maximum price per night"),
    minPrice: z.number().optional().describe("Minimum price per night"),
    amenities: z.array(z.string()).optional().describe("Amenities the listing should have"),
});

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const textSearch = (value) => ({
    $regex: escapeRegex(value),
    $options: "i",
});

export const createListingSearchTool = (saveResults) =>
    tool({
        description: "Find real Nestly listings using location, country, keyword, and price filters.",
        inputSchema: searchInput,
        execute: async ({ location, country, keyword, minPrice, maxPrice, amenities }) => {
            const query = {};

            if (location) {
                query.location = textSearch(location);
            }
            if (country) {
                query.country = textSearch(country);
            }
            if (keyword) {
                query.$or = [
                    { title: textSearch(keyword) },
                    { description: textSearch(keyword) },
                ];
            }
            if (minPrice !== undefined || maxPrice !== undefined) {
                query.price = {};
                if (minPrice !== undefined) query.price.$gte = minPrice;
                if (maxPrice !== undefined) query.price.$lte = maxPrice;
            }
            if (amenities?.length) {
                query.amenities = { $all: amenities };
            }

            const listings = await Listing.find(query)
                .select("_id title location country price image amenities")
                .sort({ price: 1, _id: 1 })
                .limit(12)
                .lean();

            saveResults(listings);
            return {
                count: listings.length,
                listings: listings.map(({ _id, title, location, country, price, amenities }) => ({
                    id: _id.toString(),
                    title,
                    location,
                    country,
                    price,
                    amenities,
                })),
            };
        },
    });

export const createAvailabilityTool = (saveResult) =>
    tool({
        description: "Check whether a real listing is available between two dates.",
        inputSchema: z
            .object({
                listingId: z.string().optional().describe("The listing ID to check"),
                listingTitle: z
                    .string()
                    .optional()
                    .describe("The exact listing title to check"),
                checkIn: z.string().describe("The requested check-in date in YYYY-MM-DD format"),
                checkOut: z.string().describe("The requested check-out date in YYYY-MM-DD format"),
            })
            .refine(({ listingId, listingTitle }) => listingId || listingTitle, {
                message: "A listing ID or title is required",
            }),
        execute: async ({ listingId, listingTitle, checkIn, checkOut }) => {
            const checkInDate = new Date(`${checkIn}T00:00:00.000Z`);
            const checkOutDate = new Date(`${checkOut}T00:00:00.000Z`);

            if (
                Number.isNaN(checkInDate.getTime()) ||
                Number.isNaN(checkOutDate.getTime()) ||
                checkOutDate <= checkInDate
            ) {
                const result = {
                    available: false,
                    message: "Please provide valid dates with check-out after check-in.",
                };
                saveResult(result);
                return result;
            }

            const listing = listingId && mongoose.isValidObjectId(listingId)
                ? await Listing.findById(listingId).select("title")
                : await Listing.findOne({ title: listingTitle }).select("title");
            if (!listing) {
                const result = { available: false, message: "Listing not found." };
                saveResult(result);
                return result;
            }

            const conflict = await Booking.findOne({
                listing: listing._id,
                status: "confirmed",
                checkIn: { $lt: checkOutDate },
                checkOut: { $gt: checkInDate },
            });

            const result = {
                listingId: listing._id.toString(),
                title: listing.title,
                available: !conflict,
                message: conflict
                    ? "Those dates are already booked."
                    : "Those dates are available.",
            };
            saveResult(result);
            return result;
        },
    });
