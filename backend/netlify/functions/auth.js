const crypto = require("node:crypto");
const { MongoClient } = require("mongodb");

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
let mongoClient;
let users;
let usersPromise;

function getUsersCollection() {
  if (usersPromise) return usersPromise;
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured.");
  if (!mongoClient) {
    mongoClient = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  }
  usersPromise = mongoClient.connect().then(() => {
    if (!users) {
      users = mongoClient.db(process.env.MONGODB_DB || "smart_event_experience").collection("users");
      return users.createIndex({ email: 1 }, { unique: true }).then(() => users);
    }
    return users;
  });
  return usersPromise.catch((error) => {
    usersPromise = null;
    throw error;
  });
}

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
      N: Number(n), r: Number(r), p: Number(p)
    });
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

function secret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  if (process.env.MONGODB_URI) {
    return crypto.createHash("sha256").update(`nexus-session:${process.env.MONGODB_URI}`).digest("hex");
  }
  throw new Error("SESSION_SECRET or MONGODB_URI is not configured.");
}

function encode(value) {
  return Buffer.from(value).toString("base64url");
}

function createSession(user) {
  const payload = encode(JSON.stringify({ user, exp: Date.now() + SESSION_MAX_AGE * 1000 }));
  const signature = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function readSession(event) {
  const cookies = Object.fromEntries((event.headers.cookie || "").split(";").filter(Boolean).map((part) => {
    const index = part.indexOf("=");
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
  }));
  const token = cookies.nexus_session;
  if (!token) return null;
  try {
    const [payload, signature] = token.split(".");
    const expected = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return session.exp > Date.now() ? session.user : null;
  } catch {
    return null;
  }
}

function cookie(token, maxAge = SESSION_MAX_AGE) {
  return `nexus_session=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

function response(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers },
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  try {
    const route = (event.path.split("/").pop() || "me").toLowerCase();
    if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: { "Access-Control-Allow-Origin": event.headers.origin || "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" }, body: "" };

    if (event.httpMethod === "GET" && route === "me") {
      const user = readSession(event);
      return response(user ? 200 : 401, user ? { user } : { error: "Not signed in." });
    }

    if (event.httpMethod === "POST" && route === "signout") {
      return response(200, { ok: true }, { "Set-Cookie": cookie("", 0) });
    }

    if (event.httpMethod !== "POST" || !["signup", "signin"].includes(route)) {
      return response(404, { error: "Authentication route not found." });
    }

    let payload;
    try {
      payload = JSON.parse(event.body || "{}");
    } catch {
      return response(400, { error: "Invalid request body." });
    }
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    const password = typeof payload.password === "string" ? payload.password : "";

    if (route === "signup") {
      const name = typeof payload.name === "string" ? payload.name.trim() : "";
      if (!name || !email || !password) return response(400, { error: "Name, email, and password are required." });
      if (!email.includes("@") || email.length > 254) return response(400, { error: "Enter a valid email address." });
      if (password.length < 8) return response(400, { error: "Password must be at least 8 characters." });
      const user = { name, email };
      const sessionToken = createSession(user);
      const collection = await getUsersCollection();
      try {
        await collection.insertOne({ ...user, passwordHash: hashPassword(password), createdAt: new Date() });
      } catch (error) {
        if (error.code === 11000) return response(409, { error: "An account with that email already exists." });
        throw error;
      }
      return response(201, { user }, { "Set-Cookie": cookie(sessionToken) });
    }

    const collection = await getUsersCollection();
    const storedUser = await collection.findOne({ email });
    if (!storedUser || !verifyPassword(password, storedUser.passwordHash)) return response(401, { error: "Email or password is incorrect." });
    const user = { name: storedUser.name, email: storedUser.email };
    return response(200, { user }, { "Set-Cookie": cookie(createSession(user)) });
  } catch (error) {
    console.error("Authentication function error:", error);
    return response(500, { error: "Authentication service error." });
  }
};
