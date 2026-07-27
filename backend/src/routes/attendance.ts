import { FastifyInstance } from "fastify";
import db from "../db.js";
import { requireAuth } from "../plugins/auth.js";

interface SingleMarkBody {
  date?: string;
  user_id?: string;
  status?: "PRESENT" | "ABSENT";
}

interface BatchMarkBody {
  records: Array<{ user_id: string; status: "PRESENT" | "ABSENT" }>;
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

    const present_count = history.filter((r: any) => r.status === "PRESENT").length;
    const absent_count = history.filter((r: any) => r.status === "ABSENT").length;
    const total_sessions = present_count + absent_count;
    const percentage = total_sessions > 0 ? Math.round((present_count / total_sessions) * 100) : 100;

    return {
      data: {
        present_count,
        absent_count,
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

  // POST /choir/attendance/
  fastify.post("/choir/attendance/", { preHandler: requireAuth }, async (request, reply) => {
    const body = request.body as SingleMarkBody | BatchMarkBody;

    if ("records" in body && Array.isArray(body.records)) {
      const markStmt = db.prepare("INSERT INTO attendance (user_id, date, status, marked_by) VALUES (?, ?, ?, ?)");
      const date = new Date().toISOString().slice(0, 10);

      const insertMany = db.transaction((records: Array<{ user_id: string; status: string }>) => {
        for (const r of records) {
          markStmt.run(r.user_id, date, r.status, request.user!.userId);
        }
      });

      insertMany(body.records);
    } else {
      const single = body as SingleMarkBody;
      const date = single.date || new Date().toISOString().slice(0, 10);

      if (!single.user_id || !single.status) {
        return reply.status(400).send({ detail: "user_id and status required." });
      }

      db.prepare("INSERT INTO attendance (user_id, date, status, marked_by) VALUES (?, ?, ?, ?)").run(
        single.user_id, date, single.status, request.user!.userId
      );
    }

    return { data: { detail: "Attendance marked." } };
  });
}
