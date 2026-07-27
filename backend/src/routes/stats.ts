import { FastifyInstance } from "fastify";
import db from "../db.js";
import { requireAuth } from "../plugins/auth.js";

export default async function statsRoutes(fastify: FastifyInstance) {
  // GET /analytics/stats/
  fastify.get("/analytics/stats/", { preHandler: requireAuth }, async (_request, _reply) => {
    const memberCount = (db.prepare("SELECT COUNT(*) as c FROM users").get() as any).c;
    const approvedCount = (db.prepare("SELECT COUNT(*) as c FROM users WHERE approved = 1").get() as any).c;
    const pendingCount = (db.prepare("SELECT COUNT(*) as c FROM users WHERE approved = 0").get() as any).c;

    const debtTotal = (db.prepare("SELECT COALESCE(SUM(total_debt), 0) as s FROM debts").get() as any).s;
    const totalCollected = (db.prepare("SELECT COALESCE(SUM(total_paid), 0) as s FROM debts").get() as any).s;

    const docCount = (db.prepare("SELECT COUNT(*) as c FROM documents").get() as any).c;
    const musicCount = (db.prepare("SELECT COUNT(*) as c FROM songs").get() as any).c;
    const notifCount = (db.prepare("SELECT COUNT(*) as c FROM notifications").get() as any).c;

    const totalSessions = (db.prepare("SELECT COUNT(DISTINCT date) as c FROM attendance").get() as any).c;
    const presentTotal = (db.prepare("SELECT COUNT(*) as c FROM attendance WHERE status = 'PRESENT'").get() as any).c;
    const attendanceRate = totalSessions > 0 ? Math.round((presentTotal / (totalSessions * Math.max(approvedCount, 1))) * 100) : 0;

    const recentAttendance = db.prepare(`
      SELECT date,
             SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as present,
             SUM(CASE WHEN status = 'ABSENT' THEN 1 ELSE 0 END) as absent
      FROM attendance
      GROUP BY date
      ORDER BY date DESC
      LIMIT 10
    `).all() as any[];

    const sections = db.prepare("SELECT section, COUNT(*) as c FROM users WHERE approved = 1 AND section IS NOT NULL GROUP BY section").all() as any[];
    const sectionDistribution: Record<string, number> = {};
    for (const s of sections) {
      sectionDistribution[s.section] = s.c;
    }

    return {
      data: {
        member_count: memberCount,
        pending_approvals: pendingCount,
        approved_users: approvedCount,
        debt_total: debtTotal,
        document_count: docCount,
        music_count: musicCount,
        notification_count: notifCount,
        section_distribution: sectionDistribution,
        total_members: memberCount,
        active_members: approvedCount,
        total_collected: totalCollected,
        attendance_rate: attendanceRate,
        recent_attendance: recentAttendance,
      },
    };
  });
}
