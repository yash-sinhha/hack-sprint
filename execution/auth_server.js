"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const ROOT_DIR = path.resolve(__dirname, "..");
const DATABASE_PATH = process.env.AUTH_DB_PATH || path.join(ROOT_DIR, "data", "users.sqlite3");
const PORT = Number.parseInt(process.env.AUTH_PORT || "3000", 10);

fs.mkdirSync(path.dirname(DATABASE_PATH), { recursive: true });
const database = new DatabaseSync(DATABASE_PATH);
database.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

const insertUser = database.prepare(
  "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)"
);
const findUser = database.prepare(
  "SELECT name, email, password_hash FROM users WHERE email = ?"
);

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

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*"
  });
  response.end(body);
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

    try {
      insertUser.run(name, email, hashPassword(password));
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
        sendJson(response, 409, { error: "An account with that email already exists." });
        return;
      }
      throw error;
    }
    sendJson(response, 201, { user: { name, email } });
    return;
  }

  const user = findUser.get(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    sendJson(response, 401, { error: "Email or password is incorrect." });
    return;
  }
  sendJson(response, 200, { user: { name: user.name, email: user.email } });
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
  if (request.method === "OPTIONS" && route.startsWith("/api/")) {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
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
  if (request.method === "GET" || request.method === "HEAD") {
    serveStatic(request, response);
    return;
  }
  response.writeHead(404);
  response.end("404 Not Found");
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Auth server running at http://localhost:${PORT}`);
  console.log(`SQLite database: ${DATABASE_PATH}`);
});

function closeServer() {
  server.close(() => database.close());
}

process.on("SIGINT", closeServer);
process.on("SIGTERM", closeServer);