import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    try {
      const token = authHeader.split(" ")[1];
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // invalid token → treat as guest
    }
  }

  next();
};

export const attachSession = (req, res, next) => {
  let sessionId = req.headers["x-session-id"];

  if (!sessionId) {
    sessionId = uuidv4();
    res.setHeader("X-Session-Id", sessionId);
  }

  req.sessionId = sessionId;
  next();
};

/*export const attachSession = (req, res, next) => {
  let sessionId = req.headers["x-session-id"] || req.cookies?.sessionId;

  if (!sessionId) {
    sessionId = uuidv4();
    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
  }

  req.sessionId = sessionId;
  next();
};
 */
// Example auth middleware
export const authMiddleware = (req, res, next) => {
  // Assume req.user is set after token verification
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  next();
};

export const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Admin access required" });
  next();
};
