import { FastifyInstance } from "fastify";
import { v4 as uuid } from "uuid";
import db from "../db.js";
import { requireAuth } from "../plugins/auth.js";
import { sendWhatsApp } from "../lib/whatsapp.js";

const ABSENT_DEBT_AMOUNT = 20;

interface MarkRecord {
  user_id: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  late_fee?: number;
}

export default async function attendanceRoutes(fastify: FastifyInstance) {
  // GET /choir/attendance/my/
  fastify.get("/choir/attendance/my/", { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.user!.userId;

    const history = db.prepare(`
      SELECT a.*, u.full_name as user_name, u.email as user_email
      FROM attendance a JOIN users u ON u.id = a.user_id
      WHERE a.user_id = ? ORDER BY a.date DESC
    `).all(userId) as any[];

    const present_count = history.filter((r: any) => r.status === "PRESENT" || r.status === "EXCUSED").length;
    const absent_count = history.filter((r: any) => r.status === "ABSENT").length;
    const late_count = history.filter((r: any) => r.status === "LATE").length;
    const total_sessions = present_count + absent_count + late_count;
    const percentage = total_sessions > 0 ? Math.round(((present_count + late_count) / total_sessions) * 100) : 100;

    return {
      data: {
        present_count,
        absent_count,
        late_count,
        total_sessions,
        percentage,
        history,
      },
    };
  });

  // GET /choir/attendance/
  fastify.get("/choir/attendance/", { preHandler: requireAuth }, async (_request, _reply) => {
    const rows = db.prepare(`
      SELECT a.*, u.full_name as user_name, u.email as user_email
      FROM attendance a JOIN users u ON u.id = a.user_id
      ORDER BY a.date DESC, u.full_name
    `).all() as any[];

    return { data: rows };
  });

  // POST /choir/attendance/ — mark attendance for a session (date + multiple members)
  fastify.post<{ Body: { date?: string; records: MarkRecord[] } }>("/choir/attendance/", { preHandler: requireAuth }, async (request, reply) => {
    const { date: rawDate, records } = request.body;
    const date = rawDate || new Date().toISOString().slice(0, 10);

    if (!records || !Array.isArray(records) || records.length === 0) {
      return reply.status(400).send({ detail: "At least one record is required." });
    }

    const markStmt = db.prepare(
      "INSERT INTO attendance (user_id, date, status, late_fee, marked_by) VALUES (?, ?, ?, ?, ?)"
    );
    const getUser = db.prepare("SELECT id, full_name, whatsapp FROM users WHERE id = ?");

    const insertMany = db.transaction((recs: MarkRecord[]) => {
      for (const r of recs) {
        // Remove previous attendance for this user+date
        db.prepare("DELETE FROM attendance WHERE user_id = ? AND date = ?").run(r.user_id, date);

        const late_fee = r.status === "LATE" ? (r.late_fee || 10) : 0;
        markStmt.run(r.user_id, date, r.status, late_fee, request.user!.userId);

        // Auto-create debt for ABSENT
        if (r.status === "ABSENT") {
          const debt = db.prepare("SELECT id, total_debt FROM debts WHERE user_id = ?").get(r.user_id) as any;
          if (debt) {
            db.prepare("UPDATE debts SET total_absence_debt = total_absence_debt + ?, total_debt = total_debt + ?, updated_at = datetime('now') WHERE id = ?")
              .run(ABSENT_DEBT_AMOUNT, ABSENT_DEBT_AMOUNT, debt.id);
          } else {
            const did = uuid();
            db.prepare("INSERT INTO debts (id, user_id, total_absence_debt, total_debt) VALUES (?, ?, ?, ?)")
              .run(did, r.user_id, ABSENT_DEBT_AMOUNT, ABSENT_DEBT_AMOUNT);
          }
          db.prepare("INSERT INTO debt_details (id, debt_id, amount, reason, date) VALUES (?, ?, ?, ?, ?)")
            .run(uuid(), debt?.id || uuid(), ABSENT_DEBT_AMOUNT, `Absence fee - ${date}`, date);
        }

        // Auto-create debt for LATE
        if (r.status === "LATE" && late_fee > 0) {
          const debt = db.prepare("SELECT id, total_debt FROM debts WHERE user_id = ?").get(r.user_id) as any;
          if (debt) {
            db.prepare("UPDATE debts SET total_late_debt = total_late_debt + ?, total_debt = total_debt + ?, updated_at = datetime('now') WHERE id = ?")
              .run(late_fee, late_fee, debt.id);
          } else {
            const did = uuid();
            db.prepare("INSERT INTO debts (id, user_id, total_late_debt, total_debt) VALUES (?, ?, ?, ?)")
              .run(did, r.user_id, late_fee, late_fee);
          }
          db.prepare("INSERT INTO debt_details (id, debt_id, amount, reason, date) VALUES (?, ?, ?, ?, ?)")
            .run(uuid(), debt?.id || uuid(), late_fee, `Late fee - ${date}`, date);
        }

        // Send WhatsApp notification
        const user = getUser.get(r.user_id) as any;
        if (user?.whatsapp) {
          let msg = "";
          if (r.status === "ABSENT") msg = `You were marked ABSENT for rehearsal on ${date}. A debt of ₦${ABSENT_DEBT_AMOUNT} has been added to your account.`;
          else if (r.status === "LATE") msg = `You were marked LATE for rehearsal on ${date}. A late fee of ₦${late_fee} has been added.`;
          else if (r.status === "PRESENT") msg = `You were marked PRESENT for rehearsal on ${date}.`;
          else msg = `Your attendance for ${date} was recorded as ${r.status}.`;
          if (msg) sendWhatsApp(user.whatsapp, msg).catch(() => {});
        }
      }
    });

    insertMany(records);

    // Audit log
    db.prepare("INSERT INTO audit_logs (action, performed_by, details, created_at) VALUES (?, ?, ?, datetime('now'))")
      .run("Attendance marked", request.user!.userId, `Marked ${records.length} members for ${date}`);

    return { data: { detail: `Attendance marked for ${records.length} members.` } };
  });
}
