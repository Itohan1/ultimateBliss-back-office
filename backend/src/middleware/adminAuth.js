import jwt from "jsonwebtoken";

/* Protect any route */
export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    console.log("This is the user", req.user);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const adProtect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach standardized fields
    req.user = {
      userId: decoded.userId, // <-- now available for createTextAd
      role: decoded.role,
    };

    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* Admin only */
export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

/* Super admin only (optional) */
export const superAdminOnly = (req, res, next) => {
  if (!req.user.isSuperAdmin) {
    return res.status(403).json({ message: "Super admin access required" });
  }
  next();
};
