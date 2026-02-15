import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, "your_secret_key");

    req.user = decoded; // { id: userId }

    next();

  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
