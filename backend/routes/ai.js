import express from "express";
import wrapAsync from "../utils/wrapAsync.js";
import * as aiController from "../controllers/ai.js";
import { limitAiRequests } from "../middleware/rateLimitAi.js";

const router = express.Router();

router.post("/chat", limitAiRequests, wrapAsync(aiController.chat));

export default router;
