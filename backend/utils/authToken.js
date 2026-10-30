
import jwt from "jsonwebtoken";

const COOKIE_NAME = "shopsphere_session";

export function generateToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { sub: userId.toString() },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
      algorithm: "HS256",
    }
  );
}

export function setAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res) {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });
}

export { COOKIE_NAME };
