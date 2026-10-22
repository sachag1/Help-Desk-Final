// End-to-end API test. Run from the server folder after `npm run build`:  node tests/api.test.js
// It needs a local MongoDB and a .env file. It uses the database named in MONGODB_DB and EMPTIES its
// "tickets" and "admins" collections first, so never point it at a database you want to keep.
const { spawn, spawnSync, execSync } = require("node:child_process");
const { createHmac } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { MongoClient } = require("mongodb");

const serverDir = path.join(__dirname, "..");
const env = Object.fromEntries(
  fs.readFileSync(path.join(serverDir, ".env"), "utf8").split(/\r?\n/)
    .filter((line) => line.includes("=") && !line.startsWith("#"))
    .map((line) => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1)])
);
const base = `http://localhost:${env.PORT ?? 3000}`;
let failed = 0;
let passed = 0;
const check = (name, condition, extra) => {
  if (condition) passed++; else failed++;
  console.log((condition ? "PASS " : "FAIL ") + name + (condition ? "" : " -> " + JSON.stringify(extra)));
};
const kill = (child) => { try { execSync(`taskkill /PID ${child.pid} /T /F`, { stdio: "ignore" }); } catch { /* already gone */ } };

async function call(method, url, { body, rawBody, token, headers = {} } = {}) {
  const response = await fetch(base + url, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    body: rawBody ?? (body === undefined ? undefined : JSON.stringify(body)),
  });
  const bytes = Buffer.from(await response.arrayBuffer());
  const text = bytes.toString("utf8");
  let json = null;
  try { json = JSON.parse(text); } catch { /* not JSON */ }
  return { status: response.status, json, text, bytes, headers: response.headers };
}

const base64url = (value) => Buffer.from(value).toString("base64url");
function forgeToken(secret, payload) {
  const content = `${base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }))}.${base64url(JSON.stringify(payload))}`;
  return `${content}.${createHmac("sha256", secret).update(content).digest("base64url")}`;
}

const validTicket = {
  fullName: "Daniel Cohen",
  email: "daniel@example.com",
  phone: "050-1234567",
  title: "Printer does not print",
  category: "Hardware",
  priority: "High",
  description: "The printer is connected but does not print documents.",
};

(async () => {
  const mongo = new MongoClient(env.MONGODB_URI);
  await mongo.connect();
  const db = mongo.db(env.MONGODB_DB);
  await db.collection("tickets").deleteMany({});
  await db.collection("admins").deleteMany({});

  const seed = spawnSync("node", ["--env-file=.env", "dist/scripts/seedAdmin.js"], { cwd: serverDir, encoding: "utf8" });
  check("seed script creates the administrator", seed.status === 0 && seed.stdout.includes("is ready"), seed);

  const server = spawn("node", ["--env-file=.env", "dist/server/index.js"], { cwd: serverDir, stdio: ["ignore", "pipe", "inherit"] });
  await new Promise((resolve, reject) => {
    server.stdout.on("data", (chunk) => { process.stdout.write("[server] " + chunk); if (String(chunk).includes("running")) resolve(); });
    server.on("exit", () => reject(new Error("server exited early")));
    setTimeout(() => reject(new Error("server start timeout")), 30000);
  });

  // ---- public: create a ticket
  let r = await call("POST", "/tickets", { body: validTicket });
  check("POST /tickets valid -> 201", r.status === 201 && r.json.success === true, r);
  const created = r.json.data;
  check("new ticket: Open, 24-hex id, dates set by the server, same data", created.status === "Open" && /^[0-9a-f]{24}$/.test(created.id) && created.createdAt === created.updatedAt && Math.abs(Date.now() - Date.parse(created.createdAt)) < 10000 && created.title === validTicket.title && created.priority === "High", created);
  r = await call("POST", "/tickets", { body: { ...validTicket, status: "Resolved", createdAt: "2000-01-01T00:00:00.000Z", updatedAt: "2000-01-01T00:00:00.000Z", id: "x" } });
  check("customer cannot choose status or dates -> Open and server dates", r.status === 201 && r.json.data.status === "Open" && Date.parse(r.json.data.createdAt) > Date.parse("2020-01-01"), r.json);
  const secondId = r.json.data.id;
  const stored = await db.collection("tickets").findOne({ title: validTicket.title });
  check("MongoDB: stored ticket has status Open and Date objects", stored !== null && stored.status === "Open" && stored.createdAt instanceof Date && stored.updatedAt instanceof Date, stored);

  // ---- public: invalid creation
  const invalid = [
    ["empty object", {}],
    ["array body", [1, 2]],
    ["missing fullName", { ...validTicket, fullName: undefined }],
    ["whitespace-only fullName", { ...validTicket, fullName: "     " }],
    ["invalid email", { ...validTicket, email: "not-an-email" }],
    ["invalid phone", { ...validTicket, phone: "abc" }],
    ["one-character title", { ...validTicket, title: "a" }],
    ["whitespace-only description", { ...validTicket, description: "          " }],
    ["short description", { ...validTicket, description: "too short" }],
    ["invalid category", { ...validTicket, category: "Plumbing" }],
    ["invalid priority", { ...validTicket, priority: "Urgent" }],
    ["invalid status", { ...validTicket, status: "Closed" }],
    ["numbers instead of strings", { ...validTicket, title: 12345 }],
  ];
  for (const [name, body] of invalid) {
    r = await call("POST", "/tickets", { body });
    check(`POST /tickets ${name} -> 400`, r.status === 400 && r.json.success === false && typeof r.json.error === "string", r);
  }
  r = await call("POST", "/tickets", { rawBody: "{ not json" });
  check("POST /tickets malformed JSON -> 400", r.status === 400 && r.json.success === false, r);
  const countAfterInvalid = await db.collection("tickets").countDocuments();
  check("MongoDB: invalid tickets were not saved (2 valid tickets only)", countAfterInvalid === 2, countAfterInvalid);

  // ---- login
  r = await call("POST", "/admin/login", { body: { username: env.ADMIN_USERNAME, password: "wrong-password" } });
  const wrongPasswordMessage = r.json && r.json.error;
  check("login with a wrong password -> 401", r.status === 401 && r.json.success === false, r);
  r = await call("POST", "/admin/login", { body: { username: "nobody", password: "whatever-123" } });
  check("login with an unknown user -> 401 with the same generic message", r.status === 401 && r.json.error === wrongPasswordMessage && r.json.error === "Invalid username or password", r);
  r = await call("POST", "/admin/login", { body: { username: env.ADMIN_USERNAME } });
  check("login without a password -> 400", r.status === 400, r);
  r = await call("POST", "/admin/login", { body: {} });
  check("login with an empty body -> 400", r.status === 400, r);
  r = await call("POST", "/admin/login", {});
  check("login without a body -> 400", r.status === 400, r);
  r = await call("POST", "/admin/login", { body: { username: env.ADMIN_USERNAME, password: env.ADMIN_PASSWORD } });
  check("login with the right credentials -> 200 and a token", r.status === 200 && r.json.success === true && r.json.data.token.split(".").length === 3 && r.json.data.username === env.ADMIN_USERNAME, r.json && { ...r.json, data: "(hidden)" });
  const token = r.json.data.token;
  const adminDoc = await db.collection("admins").findOne({ username: env.ADMIN_USERNAME });
  check("MongoDB: the admin password is hashed, not plain text", adminDoc !== null && adminDoc.passwordHash.startsWith("scrypt$") && !JSON.stringify(adminDoc).includes(env.ADMIN_PASSWORD), "(hidden)");

  // ---- protected endpoints without / with bad authorization
  const protectedCalls = [
    ["GET", "/tickets"], ["GET", `/tickets/${created.id}`], ["PATCH", `/tickets/${created.id}`], ["DELETE", `/tickets/${created.id}`], ["GET", "/tickets/export/csv"],
  ];
  for (const [method, url] of protectedCalls) {
    r = await call(method, url, { body: method === "PATCH" ? { status: "Resolved" } : undefined });
    check(`${method} ${url.replace(created.id, ":id")} without a token -> 401`, r.status === 401 && r.json.success === false, r);
  }
  r = await call("GET", "/tickets", { token: "garbage" });
  check("garbage token -> 401", r.status === 401, r);
  r = await call("GET", "/tickets", { token: token.slice(0, -3) + "abc" });
  check("tampered signature -> 401", r.status === 401, r);
  const expired = forgeToken(env.AUTH_SECRET, { sub: env.ADMIN_USERNAME, iat: 1, exp: 2 });
  r = await call("GET", "/tickets", { token: expired });
  check("expired token -> 401", r.status === 401, r);
  r = await call("GET", "/tickets", { token: forgeToken("x".repeat(40), { sub: env.ADMIN_USERNAME, iat: 1, exp: 9999999999 }) });
  check("token signed with another secret -> 401", r.status === 401, r);
  r = await call("GET", "/tickets", { token: forgeToken(env.AUTH_SECRET, { sub: "ghost", iat: 1, exp: 9999999999 }) });
  check("valid token of a non-existing admin -> 403", r.status === 403, r);
  r = await call("GET", "/tickets", { headers: { Authorization: token } });
  check("Authorization header without the Bearer prefix -> 401", r.status === 401, r);

  // ---- list / get
  r = await call("GET", "/tickets", { token });
  check("GET /tickets with the token -> 200 and the 2 tickets, newest first", r.status === 200 && r.json.data.length === 2 && r.json.data[0].id === secondId && r.json.data[1].id === created.id, r.json);
  r = await call("GET", `/tickets/${created.id}`, { token });
  check("GET /tickets/:id -> 200 with the full ticket", r.status === 200 && r.json.data.id === created.id && r.json.data.description === validTicket.description, r);
  r = await call("GET", "/tickets/not-an-object-id", { token });
  check("GET /tickets/:id with an invalid id -> 400", r.status === 400 && r.json.success === false, r);
  r = await call("GET", "/tickets/66a1234567890abcdef12345", { token });
  check("GET /tickets/:id valid but unknown -> 404", r.status === 404 && r.json.error === "Ticket not found", r);

  // ---- update
  await new Promise((resolve) => setTimeout(resolve, 20));
  r = await call("PATCH", `/tickets/${created.id}`, { token, body: { status: "In Progress" } });
  check("PATCH status -> 200, status changed, updatedAt later, createdAt unchanged", r.status === 200 && r.json.data.status === "In Progress" && Date.parse(r.json.data.updatedAt) > Date.parse(created.updatedAt) && r.json.data.createdAt === created.createdAt, r.json);
  const afterStatus = r.json.data;
  r = await call("PATCH", `/tickets/${created.id}`, { token, body: { priority: "Low" } });
  check("PATCH priority -> 200, updatedAt moved again", r.status === 200 && r.json.data.priority === "Low" && r.json.data.status === "In Progress" && Date.parse(r.json.data.updatedAt) >= Date.parse(afterStatus.updatedAt), r.json);
  const storedAfter = await db.collection("tickets").findOne({ title: validTicket.title, priority: "Low" });
  check("MongoDB holds the new values", storedAfter !== null && storedAfter.status === "In Progress" && storedAfter.priority === "Low" && storedAfter.updatedAt > storedAfter.createdAt, storedAfter);
  r = await call("PATCH", `/tickets/${created.id}`, { token, body: { status: "Resolved", priority: "Medium" } });
  check("PATCH both fields -> 200", r.status === 200 && r.json.data.status === "Resolved" && r.json.data.priority === "Medium", r.json);
  for (const [name, body] of [
    ["invalid status", { status: "Closed" }],
    ["invalid priority", { priority: "Critical" }],
    ["a field that may not be updated (title)", { title: "hacked title" }],
    ["createdAt", { createdAt: "2000-01-01" }],
    ["an empty object", {}],
    ["an array", ["status"]],
  ]) {
    r = await call("PATCH", `/tickets/${created.id}`, { token, body });
    check(`PATCH ${name} -> 400`, r.status === 400 && r.json.success === false, r);
  }
  r = await call("PATCH", `/tickets/${created.id}`, { token, rawBody: "{ broken" });
  check("PATCH malformed JSON -> 400", r.status === 400, r);
  r = await call("PATCH", "/tickets/not-an-object-id", { token, body: { status: "Open" } });
  check("PATCH invalid id -> 400", r.status === 400, r);
  r = await call("PATCH", "/tickets/66a1234567890abcdef12345", { token, body: { status: "Open" } });
  check("PATCH unknown ticket -> 404", r.status === 404, r);
  const unchanged = await db.collection("tickets").findOne({ title: validTicket.title, status: "Resolved" });
  check("rejected updates did not change the ticket (title intact)", unchanged !== null && unchanged.title === validTicket.title, unchanged);

  // ---- CSV
  r = await call("POST", "/tickets", { body: { ...validTicket, fullName: "Formula \"Quote\" Guy", title: "=1+1 cmd", description: "Line one, with comma\nand a second line with \"quotes\"", phone: "+972 50 123 4567" } });
  const trickyId = r.json.data.id;
  r = await call("GET", "/tickets/export/csv", { token });
  const lines = r.text.replace(/^﻿/, "");
  check("CSV: 200, text/csv, attachment tickets.csv", r.status === 200 && /^text\/csv/.test(r.headers.get("content-type")) && /attachment; filename="?tickets\.csv"?/.test(r.headers.get("content-disposition")), [r.status, r.headers.get("content-type"), r.headers.get("content-disposition")]);
  check("CSV: UTF-8 BOM and the header row in the documented order", r.bytes.subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf])) && lines.startsWith('"Ticket ID","Title","Customer Name","Email","Phone","Category","Priority","Status","Description","Created At","Updated At"'), r.text.slice(0, 200));
  check("CSV: contains each ticket id once and the ticket values", [created.id, secondId, trickyId].every((id) => lines.split(id).length === 2) && lines.includes('"Resolved"') && lines.includes('"daniel@example.com"'), lines);
  check("CSV: quotes are doubled, multi-line cell kept, formulas neutralised", lines.includes('"Formula ""Quote"" Guy"') && lines.includes("\"'=1+1 cmd\"") && lines.includes('and a second line with ""quotes""'), lines);
  check("CSV: international phone number is kept as typed", lines.includes('"+972 50 123 4567"'), lines);
  r = await call("GET", "/tickets/export/csv", { token, headers: { Origin: "http://localhost:3005" } });
  check("CORS: allowed origin + Content-Disposition exposed", r.headers.get("access-control-allow-origin") === "http://localhost:3005" && /Content-Disposition/i.test(r.headers.get("access-control-expose-headers") ?? ""), [...r.headers]);
  r = await call("GET", "/tickets", { token, headers: { Origin: "http://evil.example" } });
  check("CORS: other origins get no allow-origin header", r.headers.get("access-control-allow-origin") === null);
  const preflight = await fetch(base + "/tickets/66a1234567890abcdef12345", { method: "OPTIONS", headers: { Origin: "http://localhost:3005", "Access-Control-Request-Method": "PATCH", "Access-Control-Request-Headers": "authorization,content-type" } });
  check("CORS preflight for PATCH with Authorization header", preflight.status === 204 && /PATCH/.test(preflight.headers.get("access-control-allow-methods") ?? "") && /authorization/i.test(preflight.headers.get("access-control-allow-headers") ?? ""), [preflight.status, [...preflight.headers]]);

  // ---- delete
  r = await call("DELETE", "/tickets/not-an-object-id", { token });
  check("DELETE invalid id -> 400", r.status === 400, r);
  r = await call("DELETE", "/tickets/66a1234567890abcdef12345", { token });
  check("DELETE unknown ticket -> 404", r.status === 404 && r.json.error === "Ticket not found", r);
  r = await call("DELETE", `/tickets/${created.id}`, { token });
  check("DELETE existing ticket -> 200", r.status === 200 && r.json.success === true && r.json.data.id === created.id, r);
  check("MongoDB: the deleted ticket is gone", (await db.collection("tickets").countDocuments({ title: validTicket.title, fullName: "Daniel Cohen", status: "Resolved" })) === 0);
  r = await call("GET", `/tickets/${created.id}`, { token });
  check("GET deleted ticket -> 404", r.status === 404, r);
  r = await call("DELETE", `/tickets/${created.id}`, { token });
  check("DELETE the same ticket again -> 404", r.status === 404, r);
  r = await call("GET", "/nothing-here");
  check("unknown route -> 404 JSON", r.status === 404 && r.json.success === false, r);

  // ---- empty collection
  await db.collection("tickets").deleteMany({});
  r = await call("GET", "/tickets", { token });
  check("GET /tickets on an empty collection -> 200 and []", r.status === 200 && Array.isArray(r.json.data) && r.json.data.length === 0, r);
  r = await call("GET", "/tickets/export/csv", { token });
  check("CSV of an empty collection -> only the header row", r.status === 200 && r.text.replace(/^﻿/, "").trim().split(/\r?\n/).length === 1, r.text);

  kill(server);
  await mongo.close();

  // ---- start-up failures
  const run = (extraEnv) => new Promise((resolve) => {
    const child = spawn("node", ["dist/server/index.js"], { cwd: serverDir, env: { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot, PORT: "3001", ...extraEnv }, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk));
    child.stderr.on("data", (chunk) => (output += chunk));
    child.on("exit", (code) => resolve({ code, output }));
    setTimeout(() => { kill(child); resolve({ code: "timeout", output }); }, 30000);
  });
  let result = await run({ MONGODB_URI: "mongodb://127.0.0.1:1", AUTH_SECRET: env.AUTH_SECRET });
  check("MongoDB unreachable at start-up -> exit code 1 and a message", result.code === 1 && result.output.includes("Failed to start the server"), result);
  result = await run({ MONGODB_URI: env.MONGODB_URI });
  check("missing AUTH_SECRET -> exit code 1 and a message", result.code === 1 && result.output.includes("AUTH_SECRET"), result);
  result = await run({ AUTH_SECRET: env.AUTH_SECRET });
  check("missing MONGODB_URI -> exit code 1 and a message", result.code === 1 && result.output.includes("MONGODB_URI"), result);

  console.log(failed === 0 ? `ALL PASSED (${passed} checks)` : `${failed} FAILED, ${passed} passed`);
  process.exit(failed === 0 ? 0 : 1);
})().catch((error) => { console.error(error); process.exit(1); });
