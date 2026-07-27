import { FastifyInstance } from "fastify";
import { v4 as uuid } from "uuid";
import db from "../db.js";
import { requireAuth } from "../plugins/auth.js";

interface DebtUpdateBody {
  total_absence_debt?: number;
  total_late_debt?: number;
  total_paid?: number;
  total_debt?: number;
}

export default async function debtRoutes(fastify: FastifyInstance) {
  // GET /debts/my/
  fastify.get("/debts/my/", { preHandler: requireAuth }, async (request, reply) => {
    const row = db.prepare(`
      SELECT d.*, u.full_name as user_name FROM debts d
      JOIN users u ON u.id = d.user_id
      WHERE d.user_id = ?
    `).get(request.user!.userId) as any;

    if (!row) {
      return reply.status(404).send({ detail: "No debt record." });
    }

    const details = db.prepare("SELECT * FROM debt_details WHERE debt_id = ?").all(row.id) as any[];

    return {
      data: {
        id: row.id,
        user_name: row.user_name,
        total_absence_debt: row.total_absence_debt,
        total_late_debt: row.total_late_debt,
        total_paid: row.total_paid,
        total_debt: row.total_debt,
        updated_at: row.updated_at,
        details,
      },
    };
  });

  // GET /debts/list/
  fastify.get("/debts/list/", { preHandler: requireAuth }, async (_request, _reply) => {
    const rows = db.prepare(`
      SELECT d.*, u.full_name as user_name FROM debts d
      JOIN users u ON u.id = d.user_id
      ORDER BY u.full_name
    `).all() as any[];

    const debts = rows.map((row) => {
      const details = db.prepare("SELECT * FROM debt_details WHERE debt_id = ?").all(row.id) as any[];
      return { ...row, details };
    });

    return { data: debts };
  });

  // POST /debts/user/:userId/
  fastify.post<{ Params: { userId: string }; Body: DebtUpdateBody }>("/debts/user/:userId/", { preHandler: requireAuth }, async (request, reply) => {
    const { userId } = request.params;
    const body = request.body;

    const user = db.prepare("SELECT id FROM users WHERE id = ?").get(userId) as any;
    if (!user) {
      return reply.status(404).send({ detail: "User not found." });
    }

    const existing = db.prepare("SELECT id FROM debts WHERE user_id = ?").get(userId) as any;

    if (existing) {
      const sets: string[] = [];
      const vals: any[] = [];
      if (body.total_absence_debt !== undefined) { sets.push("total_absence_debt = ?"); vals.push(body.total_absence_debt); }
      if (body.total_late_debt !== undefined) { sets.push("total_late_debt = ?"); vals.push(body.total_late_debt); }
      if (body.total_paid !== undefined) { sets.push("total_paid = ?"); vals.push(body.total_paid); }
      if (body.total_debt !== undefined) { sets.push("total_debt = ?"); vals.push(body.total_debt); }
      sets.push("updated_at = datetime('now')");
      vals.push(existing.id);
      db.prepare(`UPDATE debts SET ${sets.join(", ")} WHERE id = ?`).run(...vals);
    } else {
      const id = uuid();
      db.prepare(`
        INSERT INTO debts (id, user_id, total_absence_debt, total_late_debt, total_paid, total_debt)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, userId, body.total_absence_debt || 0, body.total_late_debt || 0, body.total_paid || 0, body.total_debt || 0);
    }

    const updated = db.prepare(`
      SELECT d.*, u.full_name as user_name FROM debts d
      JOIN users u ON u.id = d.user_id WHERE d.user_id = ?
    `).get(userId) as any;

    return { data: updated };
  });
}
