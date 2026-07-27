const Database = require("better-sqlite3");
const path = require("path");
const db = new Database(path.join(__dirname, "data", "app.db"));
const rows = db.prepare("SELECT email, password_hash FROM users").all();
console.log("Users count:", rows.length);
for (const r of rows) {
  console.log(r.email, r.password_hash ? r.password_hash.slice(0, 20) + "..." : "MISSING");
}
db.close();
