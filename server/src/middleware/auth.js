import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing or invalid Authorization header." });
    }

    const token = header.split(" ")[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = payload.userId; // attach userId to request
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
}
