import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import db, { initDb } from "./db.js";

async function seed() {
  initDb();

  // Clear existing data
  for (const table of ["debt_details", "debts", "attendance", "documents", "songs", "notifications", "users", "roles"]) {
    db.prepare(`DELETE FROM ${table}`).run();
  }

  // Roles
  const roles = [
    { id: uuid(), name: "member", description: "Regular choir member" },
    { id: uuid(), name: "president", description: "Choir president" },
    { id: uuid(), name: "secretary", description: "Choir secretary" },
    { id: uuid(), name: "custodian", description: "Choir custodian" },
  ];
  const insertRole = db.prepare("INSERT INTO roles (id, name, description) VALUES (?, ?, ?)");
  for (const r of roles) insertRole.run(r.id, r.name, r.description);

  const hash = await bcrypt.hash("password123", 10);

  // Users
  const users = [
    { id: uuid(), full_name: "Admin President", email: "president@avc.com", phone: "555-0100", role: "president", section: "tenor", approved: 1 },
    { id: uuid(), full_name: "Jane Secretary", email: "secretary@avc.com", phone: "555-0101", role: "secretary", section: "soprano", approved: 1 },
    { id: uuid(), full_name: "Mark Custodian", email: "custodian@avc.com", phone: "555-0102", role: "custodian", section: "bass", approved: 1 },
    { id: uuid(), full_name: "John Member", email: "member@avc.com", phone: "555-0103", role: "member", section: "tenor", approved: 1 },
    { id: uuid(), full_name: "Sarah Alto", email: "sarah@avc.com", phone: "555-0104", role: "member", section: "alto", approved: 1 },
    { id: uuid(), full_name: "Mike Bass", email: "mike@avc.com", phone: "555-0105", role: "member", section: "bass", approved: 1 },
    { id: uuid(), full_name: "Lisa Soprano", email: "lisa@avc.com", phone: "555-0106", role: "member", section: "soprano", approved: 1 },
    { id: uuid(), full_name: "Pending User", email: "pending@avc.com", phone: "555-0107", role: "member", section: null, approved: 0 },
  ];

  const insertUser = db.prepare(
    "INSERT INTO users (id, full_name, email, phone, password_hash, role, section, approved, date_joined) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );

  const now = new Date();
  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    const date = new Date(now);
    date.setDate(date.getDate() - (users.length - i) * 3);
    insertUser.run(u.id, u.full_name, u.email, u.phone, hash, u.role, u.section, u.approved, date.toISOString());
  }

  // Debts
  const debtUserIds = users.filter((u) => u.approved).map((u) => u.id);
  const insertDebt = db.prepare(
    "INSERT INTO debts (id, user_id, total_absence_debt, total_late_debt, total_paid, total_debt, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  const insertDetail = db.prepare(
    "INSERT INTO debt_details (id, debt_id, amount, reason, date, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  );

  const debts = [
    { userId: debtUserIds[0], absence: 50, late: 20, paid: 30 },
    { userId: debtUserIds[1], absence: 0, late: 10, paid: 10 },
    { userId: debtUserIds[2], absence: 30, late: 0, paid: 15 },
    { userId: debtUserIds[3], absence: 100, late: 50, paid: 80 },
    { userId: debtUserIds[4], absence: 20, late: 5, paid: 25 },
  ];

  for (const d of debts) {
    const did = uuid();
    const total = d.absence + d.late;
    insertDebt.run(did, d.userId, d.absence, d.late, d.paid, total, now.toISOString());
    insertDetail.run(uuid(), did, d.absence + d.late, "Total debt", now.toISOString().slice(0, 10), now.toISOString());
  }

  // Attendance
  const insertAtt = db.prepare(
    "INSERT INTO attendance (user_id, date, status, marked_by, created_at) VALUES (?, ?, ?, ?, ?)"
  );

  const sessions = ["2026-07-13", "2026-07-20"];
  for (const date of sessions) {
    for (const uid of debtUserIds) {
      const status = Math.random() > 0.2 ? "PRESENT" : "ABSENT";
      insertAtt.run(uid, date, status, debtUserIds[0], now.toISOString());
    }
  }

  // Notifications
  const insertNotif = db.prepare(
    "INSERT INTO notifications (id, type, message, is_read, created_at) VALUES (?, ?, ?, ?, ?)"
  );

  const notifications = [
    { type: "announcement", message: "Welcome to the new choir season! Rehearsals start Saturday at 4pm." },
    { type: "announcement", message: "Reminder: Membership fees are due by end of month." },
    { type: "reminder", message: "Practice at 3pm this Saturday — please bring your music sheets." },
    { type: "announcement", message: "Easter performance scheduled for April 20th." },
  ];

  for (let i = 0; i < notifications.length; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 2);
    insertNotif.run(uuid(), notifications[i].type, notifications[i].message, i > 0 ? 1 : 0, d.toISOString());
  }

  console.log("Seed complete. Users created:");
  console.log("  president@avc.com / password123 (President)");
  console.log("  secretary@avc.com / password123 (Secretary)");
  console.log("  custodian@avc.com / password123 (Custodian)");
  console.log("  member@avc.com / password123 (Member)");
  console.log("  pending@avc.com / password123 (Pending approval)");
}

seed().catch(console.error);
