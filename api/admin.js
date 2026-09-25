import crypto from "crypto";

const COOKIE_NAME = "dgt_admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 8;

function getCookie(req, name) {
  const header = req.headers.cookie || "";
  const parts = header.split(";");

  for (const part of parts) {
    const [key, ...valueParts] = part.trim().split("=");

    if (key === name) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

function createAdminSignature() {
  const secret = process.env.ADMIN_PASSWORD;

  if (!secret) {
    return null;
  }

  return crypto
    .createHmac("sha256", secret)
    .update("dgt-admin-session")
    .digest("hex");
}

function setAdminCookie(res, signature) {
  const cookie = [
    `${COOKIE_NAME}=${encodeURIComponent(signature)}`,
    "Path=/",
    `Max-Age=${COOKIE_MAX_AGE}`,
    "HttpOnly",
    "SameSite=Strict",
    "Secure"
  ].join("; ");

  res.setHeader("Set-Cookie", cookie);
}

function isAdminAuthenticated(req) {
  const expectedSignature = createAdminSignature();
  const receivedSignature = getCookie(req, COOKIE_NAME);

  if (!expectedSignature || !receivedSignature) {
    return false;
  }

  const expected = Buffer.from(expectedSignature, "utf8");
  const received = Buffer.from(receivedSignature, "utf8");

  if (expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, received);
}

export default async function handler(req, res) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({
      error: "Admin password is not configured"
    });
  }

  if (req.method === "GET") {
    if (!isAdminAuthenticated(req)) {
      return res.status(401).json({
        authenticated: false
      });
    }

    return res.status(200).json({
      authenticated: true
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const { password } = req.body || {};

  if (!password) {
    return res.status(401).json({
      authenticated: false
    });
  }

  const expected = Buffer.from(adminPassword, "utf8");
  const received = Buffer.from(String(password), "utf8");

  const passwordCorrect =
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received);

  if (!passwordCorrect) {
    return res.status(401).json({
      authenticated: false
    });
  }

  const signature = createAdminSignature();

  if (!signature) {
    return res.status(500).json({
      error: "Admin session could not be created"
    });
  }

  setAdminCookie(res, signature);

  return res.status(200).json({
    authenticated: true
  });
}
