import { z } from "zod";

const priceSchema = z.preprocess(
    (value) => (value === "" ? undefined : Number(value)),
    z.number({ message: "Price must be a number" })
        .finite("Price must be a number")
        .min(0, "Price must be at least 0"),
);

const ratingSchema = z.preprocess(
    (value) => (value === "" ? undefined : Number(value)),
    z.number({ message: "Rating must be a number" })
        .finite("Rating must be a number")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating must be at most 5"),
);

export const listingSchema = z.object({
    listing: z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
        price: priceSchema,
        location: z.string().min(1, "Location is required"),
        country: z.string().min(1, "Country is required"),
        image: z
            .object({
                url: z.string().optional(),
            })
            .optional(),
    }),
});

export const reviewSchema = z.object({
    review: z.object({
        rating: ratingSchema,
        comment: z.string().min(1, "Comment is required"),
    }),
});

export const bookingSchema = z.object({
    booking: z
        .object({
            checkIn: z.coerce.date({ message: "Check-in date is required" }),
            checkOut: z.coerce.date({ message: "Check-out date is required" }),
        })
        .refine(
            ({ checkIn, checkOut }) => checkOut > checkIn,
            "Check-out must be after check-in",
        )
        .refine(
            ({ checkIn }) => {
                const today = new Date();
                today.setUTCHours(0, 0, 0, 0);
                return checkIn >= today;
            },
            "Check-in cannot be in the past",
        ),
});
