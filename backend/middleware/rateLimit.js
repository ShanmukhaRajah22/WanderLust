const createRateLimiter = ({ windowMs, max, message }) => {
    const requests = new Map();

    return (req, res, next) => {
        const now = Date.now();
        const recent = (requests.get(req.ip) || []).filter(
            (time) => now - time < windowMs,
        );

        if (recent.length >= max) {
            return res.status(429).json({ message });
        }

        recent.push(now);
        requests.set(req.ip, recent);
        next();
    };
};

export const limitAuthRequests = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many account requests. Please try again later.",
});

export const limitBookingRequests = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: "Too many booking requests. Please try again later.",
});
