import { FastifyInstance } from "fastify";
import db from "../db.js";
import { requireAuth } from "../plugins/auth.js";

export default async function memberRoutes(fastify: FastifyInstance) {
  // GET /auth/users/
  fastify.get("/auth/users/", { preHandler: requireAuth }, async (request, reply) => {
    const query = request.query as Record<string, string>;
    let sql = "SELECT * FROM users WHERE 1=1";
    const params: any[] = [];

    if (query.status === "pending") {
      sql += " AND approved = 0";
    } else if (query.status === "approved") {
      sql += " AND approved = 1";
    }

    if (query.section) {
      sql += " AND section = ?";
      params.push(query.section);
    }

    if (query.q) {
      sql += " AND (full_name LIKE ? OR email LIKE ?)";
      params.push(`%${query.q}%`, `%${query.q}%`);
    }

    sql += " ORDER BY date_joined DESC";

    const rows = db.prepare(sql).all(...params) as any[];

    const users = rows.map((row) => ({
      id: row.id,
      full_name: row.full_name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      section: row.section,
      date_joined: row.date_joined,
      approved: !!row.approved,
      is_approved: !!row.approved,
      avatar: row.avatar,
    }));

    return { data: users };
  });

  // GET /auth/approvals/pending/
  fastify.get("/auth/approvals/pending/", { preHandler: requireAuth }, async (request, reply) => {
    const rows = db.prepare("SELECT * FROM users WHERE approved = 0 ORDER BY date_joined DESC").all() as any[];

    const users = rows.map((row) => ({
      id: row.id,
      full_name: row.full_name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      section: row.section,
      date_joined: row.date_joined,
      approved: !!row.approved,
      is_approved: !!row.approved,
      avatar: row.avatar,
    }));

    return { data: users };
  });

  // POST /auth/approvals/:id/approve/
  fastify.post<{ Params: { id: string } }>("/auth/approvals/:id/approve/", { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params;
    const result = db.prepare("UPDATE users SET approved = 1 WHERE id = ? AND approved = 0").run(id);

    if (result.changes === 0) {
      return reply.status(404).send({ detail: "User not found or already approved." });
    }

    return { data: { detail: "User approved." } };
  });

  // POST /auth/approvals/:id/reject/
  fastify.post<{ Params: { id: string } }>("/auth/approvals/:id/reject/", { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params;
    const result = db.prepare("DELETE FROM users WHERE id = ? AND approved = 0").run(id);

    if (result.changes === 0) {
      return reply.status(404).send({ detail: "User not found or already approved." });
    }

    return { data: { detail: "User rejected." } };
  });

  // POST /auth/users/:id/role/
  fastify.post<{ Params: { id: string }; Body: { role_id: string } }>("/auth/users/:id/role/", { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params;
    const { role_id } = request.body;

    const role = db.prepare("SELECT name FROM roles WHERE id = ?").get(role_id) as any;
    if (!role) {
      return reply.status(400).send({ detail: "Invalid role." });
    }

    const result = db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role.name, id);
    if (result.changes === 0) {
      return reply.status(404).send({ detail: "User not found." });
    }

    return { data: { detail: "Role updated." } };
  });

  // DELETE /auth/users/:id/
  fastify.delete<{ Params: { id: string } }>("/auth/users/:id/", { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params;
    const result = db.prepare("DELETE FROM users WHERE id = ?").run(id);

    if (result.changes === 0) {
      return reply.status(404).send({ detail: "User not found." });
    }

    return { data: { detail: "Deleted." } };
  });

  // GET /auth/roles/
  fastify.get("/auth/roles/", { preHandler: requireAuth }, async (_request, _reply) => {
    const roles = db.prepare("SELECT * FROM roles").all();
    return { data: roles };
  });
}
