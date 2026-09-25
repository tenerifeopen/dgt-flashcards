import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const COOKIE_NAME = "dgt_access_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

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

function createSessionKey() {
  return crypto.randomBytes(32).toString("hex");
}

function hashSessionKey(sessionKey) {
  return crypto
    .createHash("sha256")
    .update(sessionKey)
    .digest("hex");
}

function setSessionCookie(res, sessionKey, req) {
  const forwardedProto = req.headers["x-forwarded-proto"];

  const isHttps =
    forwardedProto === "https" ||
    process.env.NODE_ENV === "production";

  const cookie = [
    `${COOKIE_NAME}=${encodeURIComponent(sessionKey)}`,
    "Path=/",
    `Max-Age=${COOKIE_MAX_AGE}`,
    "HttpOnly",
    "SameSite=Lax",
    isHttps ? "Secure" : ""
  ]
    .filter(Boolean)
    .join("; ");

  res.setHeader("Set-Cookie", cookie);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const { token } = req.body || {};

  if (!token) {
    return res.status(400).json({
      error: "Token is required"
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      error: "Supabase configuration is missing"
    });
  }

  try {
    const supabase = createClient(
      supabaseUrl,
      supabaseKey
    );

    const existingSessionKey = getCookie(
      req,
      COOKIE_NAME
    );

    const sessionKey =
      existingSessionKey || createSessionKey();

    const sessionHash =
      hashSessionKey(sessionKey);

    const { data, error } =
      await supabase.rpc(
        "check_access_session",
        {
          p_token: token,
          p_session_hash: sessionHash
        }
      );

    if (error) {
      console.error(
        "Access check error:",
        error
      );

      return res.status(500).json({
        error: "Access check failed"
      });
    }

    if (!data || data.granted !== true) {
      return res.status(403).json({
        error: "Access denied"
      });
    }

    if (!existingSessionKey) {
      setSessionCookie(
        res,
        sessionKey,
        req
      );
    }

    return res.status(200).json({
      access: true,
      user: data.user
    });

  } catch (error) {
    console.error(
      "Access server error:",
      error
    );

    return res.status(500).json({
      error: "Server error"
    });
  }
}