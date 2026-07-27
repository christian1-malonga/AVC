import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import db, { initDb } from "./db.js";

async function seed() {
  initDb();

  for (const table of ["audit_logs", "receipts", "voice_notes", "debt_details", "debts", "attendance", "documents", "songs", "notifications", "users", "roles"]) {
    db.prepare(`DELETE FROM ${table}`).run();
  }

  // Roles
  const roles = [
    { name: "member", description: "Regular choir member (chorister)" },
    { name: "president", description: "Choir president — full system oversight" },
    { name: "provost", description: "Manages attendance and uploads debtor lists" },
    { name: "secretary", description: "Manages debt tracker, minutes, payment receipts" },
    { name: "custodian", description: "Manages music library and voice notes" },
  ];
  const insertRole = db.prepare("INSERT INTO roles (id, name, description) VALUES (?, ?, ?)");
  for (const r of roles) insertRole.run(uuid(), r.name, r.description);

  const hash = await bcrypt.hash("password123", 10);

  // Users — with birthdays and whatsapp
  const users = [
    { full_name: "Admin President", email: "president@avc.com", phone: "555-0100", whatsapp: "+234800000001", role: "president", section: "tenor", approved: 1, birthday: "1990-03-15" },
    { full_name: "Peter Provost", email: "provost@avc.com", phone: "555-0108", whatsapp: "+234800000002", role: "provost", section: "bass", approved: 1, birthday: "1988-07-22" },
    { full_name: "Jane Secretary", email: "secretary@avc.com", phone: "555-0101", whatsapp: "+234800000003", role: "secretary", section: "soprano", approved: 1, birthday: "1992-11-08" },
    { full_name: "Mark Custodian", email: "custodian@avc.com", phone: "555-0102", whatsapp: "+234800000004", role: "custodian", section: "bass", approved: 1, birthday: "1995-01-30" },
    { full_name: "John Member", email: "member@avc.com", phone: "555-0103", whatsapp: "+234800000005", role: "member", section: "tenor", approved: 1, birthday: "1993-09-12" },
    { full_name: "Sarah Alto", email: "sarah@avc.com", phone: "555-0104", whatsapp: "+234800000006", role: "member", section: "alto", approved: 1, birthday: "1991-05-05" },
    { full_name: "Mike Bass", email: "mike@avc.com", phone: "555-0105", whatsapp: "", role: "member", section: "bass", approved: 1, birthday: "1989-12-25" },
    { full_name: "Lisa Soprano", email: "lisa@avc.com", phone: "555-0106", whatsapp: "+234800000007", role: "member", section: "soprano", approved: 1, birthday: "1994-08-18" },
    { full_name: "Pending User", email: "pending@avc.com", phone: "555-0107", whatsapp: "", role: "member", section: null, approved: 0, birthday: null },
  ];

  const insertUser = db.prepare(
    "INSERT INTO users (id, full_name, email, phone, whatsapp, password_hash, role, section, approved, date_joined, birthday) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );

  const now = new Date();
  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    const date = new Date(now);
    date.setDate(date.getDate() - (users.length - i) * 3);
    insertUser.run(uuid(), u.full_name, u.email, u.phone, u.whatsapp || "", hash, u.role, u.section, u.approved, date.toISOString(), u.birthday);
  }

  // Debts
  const approvedUsers = db.prepare("SELECT * FROM users WHERE approved = 1").all() as any[];
  const insertDebt = db.prepare(
    "INSERT INTO debts (id, user_id, total_absence_debt, total_late_debt, total_paid, total_debt, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  const insertDetail = db.prepare(
    "INSERT INTO debt_details (id, debt_id, amount, reason, date, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  );

  const debtData = [
    { email: "president@avc.com", absence: 50, late: 20, paid: 30 },
    { email: "provost@avc.com", absence: 0, late: 0, paid: 0 },
    { email: "secretary@avc.com", absence: 0, late: 10, paid: 10 },
    { email: "custodian@avc.com", absence: 30, late: 0, paid: 15 },
    { email: "member@avc.com", absence: 100, late: 50, paid: 80 },
    { email: "sarah@avc.com", absence: 20, late: 5, paid: 25 },
  ];

  for (const d of debtData) {
    const u = approvedUsers.find((r: any) => r.email === d.email);
    if (!u) continue;
    const did = uuid();
    const total = d.absence + d.late;
    const paid = d.paid;
    insertDebt.run(did, u.id, d.absence, d.late, paid, total, now.toISOString());
    insertDetail.run(uuid(), did, total, "Opening balance", now.toISOString().slice(0, 10), now.toISOString());
    if (paid > 0) {
      insertDetail.run(uuid(), did, -paid, "Payment received", now.toISOString().slice(0, 10), now.toISOString());
    }
  }

  // Attendance with statuses including LATE and EXCUSED
  const insertAtt = db.prepare(
    "INSERT INTO attendance (user_id, date, status, late_fee, marked_by, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  );

  const sessions = [
    { date: "2026-07-13", statuses: ["PRESENT","PRESENT","PRESENT","ABSENT","PRESENT","LATE","LATE","PRESENT"] },
    { date: "2026-07-20", statuses: ["PRESENT","LATE","PRESENT","PRESENT","EXCUSED","PRESENT","PRESENT","PRESENT"] },
  ];

  for (const s of sessions) {
    for (let i = 0; i < approvedUsers.length; i++) {
      const u = approvedUsers[i];
      const status = s.statuses[i % s.statuses.length] || "PRESENT";
      const late_fee = status === "LATE" ? 10 : 0;
      insertAtt.run(u.id, s.date, status, late_fee, approvedUsers[0].id, now.toISOString());
    }
  }

  // Notifications
  const insertNotif = db.prepare(
    "INSERT INTO notifications (id, type, message, is_read, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?)"
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
    insertNotif.run(uuid(), notifications[i].type, notifications[i].message, i > 0 ? 1 : 0, null, d.toISOString());
  }

  // Voice notes
  const insertVoice = db.prepare(
    "INSERT INTO voice_notes (id, title, file_path, category, uploaded_by, uploaded_at, size) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  insertVoice.run(uuid(), "Soprano warm-up guide", "/uploads/voice/soprano-warmup.mp3", "practice", approvedUsers[3].id, now.toISOString(), 2048000);
  insertVoice.run(uuid(), "Tenor harmony practice", "/uploads/voice/tenor-harmony.mp3", "practice", approvedUsers[3].id, now.toISOString(), 3100000);

  // Receipts
  const insertReceipt = db.prepare(
    "INSERT INTO receipts (id, user_id, title, file_path, amount, uploaded_by, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  insertReceipt.run(uuid(), approvedUsers[4].id, "Membership fee - July", "/uploads/receipts/john-receipt.pdf", 80, approvedUsers[2].id, now.toISOString());
  insertReceipt.run(uuid(), approvedUsers[5].id, "Debt payment - June", "/uploads/receipts/sarah-receipt.pdf", 25, approvedUsers[2].id, now.toISOString());

  // Audit logs
  const insertLog = db.prepare(
    "INSERT INTO audit_logs (action, performed_by, target_user, details, created_at) VALUES (?, ?, ?, ?, ?)"
  );
  insertLog.run("Member approved", approvedUsers[0].id, approvedUsers[7].id, "Admin approved Lisa Soprano", new Date(now.getTime() - 60000 * 60 * 24 * 5).toISOString());
  insertLog.run("Attendance marked", approvedUsers[1].id, null, "Provost marked attendance for 2026-07-20", new Date(now.getTime() - 60000 * 60 * 24 * 2).toISOString());

  console.log("Seed complete. Users created:");
  console.log("  president@avc.com / password123 (President)");
  console.log("  provost@avc.com / password123 (Provost)");
  console.log("  secretary@avc.com / password123 (Secretary)");
  console.log("  custodian@avc.com / password123 (Custodian)");
  console.log("  member@avc.com / password123 (Member)");
  console.log("  pending@avc.com / password123 (Pending approval)");
}

seed().catch(console.error);
