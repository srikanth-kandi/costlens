import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database.js";

export async function getProjects(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const projects = await prisma.project.findMany({
      include: {
        meetings: {
          include: { participants: { include: { employee: true } } },
        },
        anomalies: true,
      },
      orderBy: { name: "asc" },
    });

    const formatted = projects.map((project) => {
      let totalCost = 0;
      let hoursSpent = 0;

      for (const meeting of project.meetings) {
        const dh = meeting.durationMinutes / 60;
        hoursSpent += dh;
        for (const p of meeting.participants as any[]) {
          totalCost += p.employee.hourlyRate * dh;
        }
      }

      const budgetUtilization = (totalCost / project.budget) * 100;

      return {
        id: project.id,
        name: project.name,
        code: project.code,
        description: project.description,
        budget: project.budget,
        status: project.status,
        teamSize: project.teamSize,
        startDate: project.startDate?.toISOString(),
        endDate: project.endDate?.toISOString(),
        totalCost: Math.round(totalCost),
        meetingCount: project.meetings.length,
        hoursSpent: Math.round(hoursSpent * 10) / 10,
        budgetUtilization: Math.round(budgetUtilization * 10) / 10,
        anomalyCount: project.anomalies.length,
      };
    });

    res.json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
}

export async function getProjectById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "Invalid project ID" });
      return;
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        meetings: {
          include: {
            participants: { include: { employee: true } },
          },
          orderBy: { meetingDate: "desc" },
        },
        anomalies: { orderBy: { detectedAt: "desc" } },
      },
    });

    if (!project) {
      res.status(404).json({ success: false, error: "Project not found" });
      return;
    }

    // Calculate weekly trend for this project
    const weeklyTrend = [];
    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - w * 7 - 6);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekMeetings = project.meetings.filter((m) => {
        const d = new Date(m.meetingDate);
        return d >= weekStart && d <= weekEnd;
      });

      let weekCost = 0;
      for (const meeting of weekMeetings) {
        const dh = meeting.durationMinutes / 60;
        weekCost += (meeting.participants as any[]).reduce(
          (sum: number, p: any) => sum + p.employee.hourlyRate * dh,
          0,
        );
      }

      weeklyTrend.push({
        week: `W${8 - w}`,
        cost: Math.round(weekCost),
        meetings: weekMeetings.length,
      });
    }

    let totalCost = 0;
    let hoursSpent = 0;
    for (const meeting of project.meetings) {
      const dh = meeting.durationMinutes / 60;
      hoursSpent += dh;
      for (const p of meeting.participants as any[]) {
        totalCost += p.employee.hourlyRate * dh;
      }
    }

    res.json({
      success: true,
      data: {
        ...project,
        startDate: project.startDate?.toISOString(),
        endDate: project.endDate?.toISOString(),
        totalCost: Math.round(totalCost),
        hoursSpent: Math.round(hoursSpent * 10) / 10,
        budgetUtilization:
          Math.round((totalCost / project.budget) * 100 * 10) / 10,
        weeklyTrend,
        meetings: project.meetings.map((m) => ({
          ...m,
          meetingDate: m.meetingDate.toISOString(),
          cost: m.cost ?? 0,
          participants: (m.participants as any[]).map((p) => ({
            meetingId: p.meetingId,
            employeeId: p.employeeId,
            employee: p.employee,
          })),
        })),
        anomalies: project.anomalies.map((a) => ({
          ...a,
          detectedAt: a.detectedAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}
