"use strict";

require("dotenv").config({ path: require("node:path").resolve(__dirname, "../../.env") });

const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { MongoClient } = require("mongodb");

const ROOT_DIR = path.resolve(__dirname, "../../frontend");
const PORT = process.env.PORT || process.env.AUTH_PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "smart_event_experience";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const sessions = new Map();

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is required in .env");
}

const mongoClient = new MongoClient(MONGODB_URI);
let users;

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$16384$8$1$${salt.toString("hex")}$${key.toString("hex")}`;
}

function verifyPassword(password, storedHash) {
  try {
    const [algorithm, n, r, p, saltHex, keyHex] = storedHash.split("$");
    if (algorithm !== "scrypt" || !saltHex || !keyHex) return false;
    const expected = Buffer.from(keyHex, "hex");
    const actual = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p)
    });
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

function sendJson(response, statusCode, payload, headers = {}) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    ...headers
  });
  response.end(body);
}

function setCorsHeaders(request, response) {
  const origin = request.headers.origin || "";
  const configuredOrigins = (process.env.FRONTEND_ORIGIN || "https://exquisite-sopapillas-77d43e.netlify.app")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin) || configuredOrigins.includes(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Vary", "Origin");
  }
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) reject(new Error("Request body too large."));
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(new Error("Invalid JSON."));
      }
    });
    request.on("error", reject);
  });
}

function parseCookies(request) {
  return Object.fromEntries((request.headers.cookie || "").split(";").filter(Boolean).map((part) => {
    const index = part.indexOf("=");
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
  }));
}

function cookieSecurity(request) {
  return request.headers["x-forwarded-proto"] === "https" || request.socket.encrypted ? "; Secure" : "";
}

function sessionCookie(request, token) {
  const sameSite = request.headers.origin && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(request.headers.origin)
    ? "None"
    : "Lax";
  return `nexus_session=${encodeURIComponent(token)}; HttpOnly${cookieSecurity(request)}; SameSite=${sameSite}; Path=/; Max-Age=${SESSION_MAX_AGE}`;
}

function expiredSessionCookie(request) {
  const sameSite = request.headers.origin && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(request.headers.origin)
    ? "None"
    : "Lax";
  return `nexus_session=; HttpOnly${cookieSecurity(request)}; SameSite=${sameSite}; Path=/; Max-Age=0`;
}

function createSession(user) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { user, expiresAt: Date.now() + SESSION_MAX_AGE * 1000 });
  return token;
}

function getSessionUser(request) {
  const token = parseCookies(request).nexus_session;
  const session = token && sessions.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    if (token) sessions.delete(token);
    return null;
  }
  return session.user;
}

async function handleAuth(request, response, route) {
  let payload;
  try {
    payload = await readJson(request);
  } catch {
    sendJson(response, 400, { error: "Invalid request body." });
    return;
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const password = typeof payload.password === "string" ? payload.password : "";

  if (route === "/api/auth/signup") {
    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    if (!name || !email || !password) {
      sendJson(response, 400, { error: "Name, email, and password are required." });
      return;
    }
    if (!email.includes("@") || email.length > 254) {
      sendJson(response, 400, { error: "Enter a valid email address." });
      return;
    }
    if (password.length < 8) {
      sendJson(response, 400, { error: "Password must be at least 8 characters." });
      return;
    }

    const user = { name, email };
    try {
      await users.insertOne({ ...user, passwordHash: hashPassword(password), createdAt: new Date() });
    } catch (error) {
      if (error.code === 11000) {
        sendJson(response, 409, { error: "An account with that email already exists." });
        return;
      }
      throw error;
    }
    const token = createSession(user);
    sendJson(response, 201, { user }, { "Set-Cookie": sessionCookie(request, token) });
    return;
  }

  const storedUser = await users.findOne({ email });
  if (!storedUser || !verifyPassword(password, storedUser.passwordHash)) {
    sendJson(response, 401, { error: "Email or password is incorrect." });
    return;
  }
  const user = { name: storedUser.name, email: storedUser.email };
  const token = createSession(user);
  sendJson(response, 200, { user }, { "Set-Cookie": sessionCookie(request, token) });
}

function handleSession(request, response, route) {
  if (route === "/api/auth/me") {
    const user = getSessionUser(request);
    sendJson(response, user ? 200 : 401, user ? { user } : { error: "Not signed in." });
    return;
  }

  const token = parseCookies(request).nexus_session;
  if (token) sessions.delete(token);
  sendJson(response, 200, { ok: true }, { "Set-Cookie": expiredSessionCookie(request) });
}

function serveStatic(request, response) {
  const requestPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const relativePath = requestPath === "/" ? "index.html" : requestPath.slice(1);
  const filePath = path.resolve(ROOT_DIR, relativePath);
  if (filePath !== ROOT_DIR && !filePath.startsWith(`${ROOT_DIR}${path.sep}`)) {
    response.writeHead(403);
    response.end("403 Forbidden");
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("404 Not Found");
      return;
    }
    const contentType = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".svg": "image/svg+xml"
    }[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    response.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-store" });
    fs.createReadStream(filePath).pipe(response);
  });
}

const server = http.createServer(async (request, response) => {
  const route = new URL(request.url, "http://localhost").pathname;
  if (route.startsWith("/api/")) {
    setCorsHeaders(request, response);
  }
  if (request.method === "OPTIONS" && route.startsWith("/api/")) {
    response.writeHead(204, {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    });
    response.end();
    return;
  }
  if (request.method === "POST" && ["/api/auth/signup", "/api/auth/signin"].includes(route)) {
    try {
      await handleAuth(request, response, route);
    } catch {
      sendJson(response, 500, { error: "Authentication service error." });
    }
    return;
  }
  if (request.method === "GET" && route === "/api/auth/me") {
    handleSession(request, response, route);
    return;
  }
  if (request.method === "POST" && route === "/api/auth/signout") {
    handleSession(request, response, route);
    return;
  }
  if (request.method === "GET" || request.method === "HEAD") {
    serveStatic(request, response);
    return;
  }
  response.writeHead(404);
  response.end("404 Not Found");
});

async function start() {
  await mongoClient.connect();
  users = mongoClient.db(MONGODB_DB).collection("users");
  await users.createIndex({ email: 1 }, { unique: true });
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Authentication server running on port ${PORT}`);
    console.log(`MongoDB database: ${MONGODB_DB}`);
  });
}

async function closeServer() {
  server.close();
  await mongoClient.close();
}

process.on("SIGINT", closeServer);
process.on("SIGTERM", closeServer);
start().catch((error) => {
  console.error("Could not start authentication server:", error.message);
  process.exit(1);
});
