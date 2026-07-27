import { FastifyInstance } from "fastify";
import db from "../db.js";
import { requireAuth } from "../plugins/auth.js";

export default async function birthdayRoutes(fastify: FastifyInstance) {
  fastify.get("/birthdays/", { preHandler: requireAuth }, async (_request, _reply) => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    const rows = db.prepare(`
      SELECT id, full_name, birthday, section, role FROM users
      WHERE birthday IS NOT NULL
      AND substr(birthday, 6, 5) = ?
      AND approved = 1
    `).all(`${month}-${day}`) as any[];

    return {
      data: rows.map((r) => ({
        id: r.id,
        full_name: r.full_name,
        birthday: r.birthday,
        section: r.section,
        role: r.role,
      })),
    };
  });

  // Also return upcoming birthdays (next 7 days)
  fastify.get("/birthdays/upcoming/", { preHandler: requireAuth }, async (_request, _reply) => {
    const rows = db.prepare("SELECT id, full_name, birthday, section, role FROM users WHERE birthday IS NOT NULL AND approved = 1").all() as any[];

    const today = new Date();
    const todayMD = today.getMonth() * 100 + today.getDate();

    const upcoming = rows
      .map((r: any) => {
        const parts = r.birthday.split("-");
        const md = parseInt(parts[1], 10) * 100 + parseInt(parts[2], 10);
        let diff = md - todayMD;
        if (diff < 0) diff += 1200; // wrap to next year
        return { ...r, daysUntil: diff };
      })
      .filter((r: any) => r.daysUntil >= 0 && r.daysUntil <= 7)
      .sort((a: any, b: any) => a.daysUntil - b.daysUntil);

    return { data: upcoming };
  });
}
