
import jwt from "jsonwebtoken";

export default function parentAuthMiddleware(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Please log in to continue.",
    });
  }

  const token = authorization.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "parent" || !decoded.parentId) {
      return res.status(403).json({
        success: false,
        message: "Parent access only.",
      });
    }

    req.parent = { id: decoded.parentId };
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Your session is invalid or expired. Please log in again.",
    });
  }
}
