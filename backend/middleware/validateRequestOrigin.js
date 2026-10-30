
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function validateRequestOrigin(req, res, next) {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }




  try {

if (!allowedOrigin) {
  return res.status(500).json({
    success: false,
    message: "Frontend origin is not configured",
  });
}

expectedOrigin = new URL(allowedOrigin).origin;

  } catch {
    return res.status(500).json({
      success: false,
      message: "Invalid frontend origin configuration",
    });
  }

  const origin = req.get("Origin");

  // Prefer Origin; use Referer only when Origin is absent.
  const source = origin || req.get("Referer");

  if (!source || source === "null") {
    return res.status(403).json({
      success: false,
      message: "Request origin verification required",
    });
  }

  let actualOrigin;

  try {
    actualOrigin = new URL(source).origin;
  } catch {
    return res.status(403).json({
      success: false,
      message: "Invalid request origin",
    });
  }

  if (actualOrigin !== expectedOrigin) {
    return res.status(403).json({
      success: false,
      message: "Request origin not allowed",
    });
  }

  next();
}
