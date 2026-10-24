const requests = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 10;

export const limitAiRequests = (req, res, next) => {
    const now = Date.now();
    const key = req.ip;
    const recent = (requests.get(key) || []).filter(
        (time) => now - time < WINDOW_MS,
    );

    if (recent.length >= MAX_REQUESTS) {
        return res.status(429).json({
            message: "Too many AI requests. Please try again in a few minutes.",
        });
    }

    recent.push(now);
    requests.set(key, recent);
    next();
};
