import { FastifyInstance } from "fastify";
import db from "../db.js";
import { requireAuth } from "../plugins/auth.js";

export default async function auditLogRoutes(fastify: FastifyInstance) {
  fastify.get("/audit-logs/", { preHandler: requireAuth }, async (request, reply) => {
    if (request.user!.role !== "president") {
      return reply.status(403).send({ detail: "Only the president can view audit logs." });
    }

    const rows = db.prepare(`
      SELECT l.*, p.full_name as performed_by_name, t.full_name as target_user_name
      FROM audit_logs l
      LEFT JOIN users p ON p.id = l.performed_by
      LEFT JOIN users t ON t.id = l.target_user
      ORDER BY l.created_at DESC LIMIT 100
    `).all() as any[];

    return { data: rows };
  });
}
