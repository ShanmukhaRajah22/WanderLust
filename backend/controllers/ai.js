import { generateText, stepCountIs } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import {
    createAvailabilityTool,
    createListingSearchTool,
} from "../utils/aiTools.js";
import ExpressError from "../utils/ExpressError.js";

const messageSchema = z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(1000),
});

const requestSchema = z.object({
    messages: z.array(messageSchema).min(1).max(12),
});

const openrouter = createOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    headers: {
        "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
        "X-Title": "Nestly",
    },
});

export const chat = async (req, res) => {
    const result = requestSchema.safeParse(req.body);
    if (!result.success) {
        throw new ExpressError(400, "Please send a valid chat message.");
    }
    if (!process.env.OPENROUTER_API_KEY) {
        throw new ExpressError(503, "AI search is not configured yet.");
    }

    let foundListings = [];
    let availability;
    const searchListings = createListingSearchTool((listings) => {
        foundListings = listings;
    });
    const checkListingAvailability = createAvailabilityTool((result) => {
        availability = result;
    });

    const response = await generateText({
        model: openrouter("openrouter/free"),
        system: `You are Nestly's helpful travel assistant.
Answer in a short, friendly way.
When the user asks to find, show, search, or recommend listings, always use the searchListings tool.
When the user asks if a specific listing is available for dates, use checkListingAvailability.
Use the exact listing title when the user names a listing and no ID is available.
Only describe listings returned by the tool. Never invent prices, locations, or properties.
If no listings match, say that no matching listings were found.
The user may search by place, country, keyword, or price.`,
        messages: result.data.messages,
        tools: { searchListings, checkListingAvailability },
        stopWhen: stepCountIs(2),
    });

    res.json({
        message: response.text || "I could not find an answer for that search.",
        listings: foundListings,
        availability,
    });
};
