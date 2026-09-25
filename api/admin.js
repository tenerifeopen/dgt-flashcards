import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

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

function getSiteOrigin(req) {
  const forwardedHost = req.headers["x-forwarded-host"];

  const host =
    forwardedHost ||
    req.headers.host ||
    "dgt-flashcards.vercel.app";

  return `https://${host}`;
}

function createAccessToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function getUsers(supabase, req) {
  const { data, error } = await supabase
    .from("access_users")
    .select(
      "id,user_name,access_code,access_token,status,session_active,last_activity,total_sessions,total_usage_seconds,issued_at,comment"
    )
    .order("issued_at", {
      ascending: true
    });

  if (error) {
    throw error;
  }

  const origin = getSiteOrigin(req);

  return (data || []).map((user) => ({
    id: user.id,
    user_name: user.user_name,
    access_code: user.access_code,
    status: user.status,
    session_active: user.session_active,
    last_activity: user.last_activity,
    total_sessions: user.total_sessions,
    total_usage_seconds: user.total_usage_seconds,
    issued_at: user.issued_at,
    comment: user.comment,
    personal_link: user.access_token
      ? `${origin}/access/${encodeURIComponent(user.access_token)}`
      : null
  }));
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

      const users = await getUsers(
        supabase,
        req
      );

      return res.status(200).json({
        authenticated: true,
        users
      });

    } catch (error) {
      console.error(
        "Admin users error:",
        error
      );

      return res.status(500).json({
        error: "Failed to load users"
      });
    }
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const body = req.body || {};

  if (body.action === "create_user") {
    if (!isAdminAuthenticated(req)) {
      return res.status(401).json({
        authenticated: false
      });
    }

    const userName = String(
      body.user_name || ""
    ).trim();

    const accessCode = String(
      body.access_code || ""
    ).trim();

    const comment = String(
      body.comment || ""
    ).trim();

    if (!userName || !accessCode) {
      return res.status(400).json({
        error: "Имя пользователя и Access code обязательны"
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

      const accessToken =
        createAccessToken();

      const { data, error } = await supabase
        .from("access_users")
        .insert({
          user_name: userName,
          access_code: accessCode,
          access_token: accessToken,
          status: "active",
          comment: comment || null
        })
        .select(
          "id,user_name,access_code,access_token,status,session_active,last_activity,total_sessions,total_usage_seconds,issued_at,comment"
        )
        .single();

      if (error) {
        console.error(
          "Create user error:",
          error
        );

        return res.status(500).json({
          error: "Не удалось создать пользователя"
        });
      }

      const origin = getSiteOrigin(req);

      return res.status(200).json({
        created: true,
        user: {
          ...data,
          personal_link:
            `${origin}/access/${encodeURIComponent(accessToken)}`
        }
      });

    } catch (error) {
      console.error(
        "Create user server error:",
        error
      );

      return res.status(500).json({
        error: "Server error"
      });
    }
  }

  const password = body.password;

  if (!password) {
    return res.status(401).json({
      authenticated: false
    });
  }

  const expected = Buffer.from(
    adminPassword,
    "utf8"
  );

  const received = Buffer.from(
    String(password),
    "utf8"
  );

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

  setAdminCookie(
    res,
    signature
  );

  return res.status(200).json({
    authenticated: true
  });
}
