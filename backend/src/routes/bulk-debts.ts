import { FastifyInstance } from "fastify";
import { v4 as uuid } from "uuid";
import db from "../db.js";
import { requireAuth } from "../plugins/auth.js";

export default async function bulkDebtRoutes(fastify: FastifyInstance) {
  // POST /debts/bulk/ — upload CSV of debtor list
  fastify.post("/debts/bulk/", { preHandler: requireAuth }, async (request, reply) => {
    if (!["provost", "secretary", "president"].includes(request.user!.role)) {
      return reply.status(403).send({ detail: "Not authorized." });
    }

    const data = await request.file();
    if (!data) return reply.status(400).send({ detail: "No file uploaded." });

    const buffer = await data.toBuffer();
    const csv = buffer.toString("utf-8");
    const lines = csv.split("\n").filter((l) => l.trim());
    if (lines.length < 2) return reply.status(400).send({ detail: "CSV must have a header row and at least one data row." });

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const emailIdx = headers.indexOf("email");
    const amountIdx = headers.indexOf("amount");
    const reasonIdx = headers.indexOf("reason");

    if (emailIdx === -1 || amountIdx === -1) {
      return reply.status(400).send({ detail: "CSV must have 'email' and 'amount' columns." });
    }

    let imported = 0;
    const errors: string[] = [];

    const insertMany = db.transaction(() => {
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim());
        const email = cols[emailIdx];
        const amount = parseFloat(cols[amountIdx]);
        const reason = reasonIdx >= 0 ? cols[reasonIdx] : "Bulk import debt";

        if (!email || isNaN(amount)) {
          errors.push(`Row ${i + 1}: invalid data`);
          continue;
        }

        const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as any;
        if (!user) {
          errors.push(`Row ${i + 1}: user not found (${email})`);
          continue;
        }

        const debt = db.prepare("SELECT id FROM debts WHERE user_id = ?").get(user.id) as any;
        if (debt) {
          db.prepare("UPDATE debts SET total_debt = total_debt + ?, total_absence_debt = total_absence_debt + ?, updated_at = datetime('now') WHERE id = ?")
            .run(amount, amount, debt.id);
          db.prepare("INSERT INTO debt_details (id, debt_id, amount, reason, date) VALUES (?, ?, ?, ?, datetime('now'))")
            .run(uuid(), debt.id, amount, reason);
        } else {
          const did = uuid();
          db.prepare("INSERT INTO debts (id, user_id, total_absence_debt, total_debt) VALUES (?, ?, ?, ?)")
            .run(did, user.id, amount, amount);
          db.prepare("INSERT INTO debt_details (id, debt_id, amount, reason, date) VALUES (?, ?, ?, ?, datetime('now'))")
            .run(uuid(), did, amount, reason);
        }

        imported++;
      }
    });

    insertMany();

    return {
      data: {
        detail: `Imported ${imported} debt records.`,
        imported,
        errors: errors.length > 0 ? errors : undefined,
      },
    };
  });
}
