import mongoose from "mongoose";
const Schema = mongoose.Schema;
import Review from "./review.js";

export const listingAmenities = [
    "WiFi",
    "Pool",
    "Kitchen",
    "Air conditioning",
    "Free parking",
    "Pet friendly",
    "Workspace",
    "Hot tub",
    "Breakfast",
    "Washer",
];

// const defaultImage =
//     "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHNreSUyMHZhY2F0aW9ufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60";

const listingSchema = new Schema({
    title: { type: String, required: true },
    description: String,

    image: {
        url: String,
        filename: String,
    },

    price: Number,
    location: String,
    country: String,
    amenities: {
        type: [String],
        enum: listingAmenities,
        default: [],
    },
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number],
            default: undefined,
        },
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
export default Listing;
