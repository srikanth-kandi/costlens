import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database.js";

export async function getDashboard(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // KPIs
    const [
      totalMeetingsResult,
      projects,
      recentMeetings,
      recentAnomalies,
      allMeetings,
    ] = await Promise.all([
      prisma.meeting.count(),
      prisma.project.findMany({
        include: { costSummary: true } as any,
      }),
      prisma.meeting.findMany({
        take: 10,
        orderBy: { meetingDate: "desc" },
        include: {
          project: true,
          participants: { include: { employee: true }, take: 5 },
        },
      }),
      prisma.anomaly.findMany({
        take: 10,
        orderBy: { detectedAt: "desc" },
        include: { project: true, meeting: true },
      }),
      prisma.meeting.findMany({
        include: { participants: { include: { employee: true } } },
      }),
    ]);

    // Calculate total HR cost from all meetings
    let totalHRCost = 0;
    const costByProject: Record<
      number,
      {
        id: number;
        name: string;
        code: string;
        budget: number;
        status: string;
        totalCost: number;
        meetingCount: number;
        hoursSpent: number;
      }
    > = {};

    for (const project of projects) {
      costByProject[project.id] = {
        id: project.id,
        name: project.name,
        code: project.code,
        budget: project.budget,
        status: project.status,
        totalCost: 0,
        meetingCount: 0,
        hoursSpent: 0,
      };
    }

    for (const meeting of allMeetings) {
      const durationHours = meeting.durationMinutes / 60;
      const cost = meeting.participants.reduce(
        (sum: number, p: any) => sum + p.employee.hourlyRate * durationHours,
        0,
      );
      totalHRCost += cost;
      if (meeting.projectId && costByProject[meeting.projectId]) {
        costByProject[meeting.projectId].totalCost += cost;
        costByProject[meeting.projectId].meetingCount += 1;
        costByProject[meeting.projectId].hoursSpent += durationHours;
      }
    }

    const activeProjects = projects.filter((p) => p.status === "active").length;
    const costOverruns = Object.values(costByProject).filter(
      (p) => p.totalCost > p.budget,
    ).length;

    // Weekly cost trend (last 8 weeks)
    const weeklyTrend = [];
    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - w * 7 - 6);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekMeetings = allMeetings.filter((m) => {
        const d = new Date(m.meetingDate);
        return d >= weekStart && d <= weekEnd;
      });

      let weekCost = 0;
      for (const meeting of weekMeetings) {
        const dh = meeting.durationMinutes / 60;
        weekCost += meeting.participants.reduce(
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

    // Cost by department
    const deptCosts: Record<string, { cost: number; employees: Set<number> }> =
      {};
    for (const meeting of allMeetings) {
      const dh = meeting.durationMinutes / 60;
      for (const p of meeting.participants as any[]) {
        const dept = p.employee.department;
        if (!deptCosts[dept])
          deptCosts[dept] = { cost: 0, employees: new Set() };
        deptCosts[dept].cost += p.employee.hourlyRate * dh;
        deptCosts[dept].employees.add(p.employee.id);
      }
    }

    const costByDepartment = Object.entries(deptCosts).map(
      ([department, data]) => ({
        department,
        cost: Math.round(data.cost),
        employees: data.employees.size,
      }),
    );

    const formattedMeetings = recentMeetings.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      durationMinutes: m.durationMinutes,
      meetingDate: m.meetingDate.toISOString(),
      projectId: m.projectId,
      projectName: (m as any).project?.name ?? "Unattributed",
      confidenceScore: m.confidenceScore,
      cost: m.cost ?? 0,
      participants: (m as any).participants.map((p: any) => ({
        meetingId: p.meetingId,
        employeeId: p.employeeId,
        employee: p.employee,
      })),
    }));

    const formattedAnomalies = recentAnomalies.map((a) => ({
      id: a.id,
      type: a.type,
      severity: a.severity,
      description: a.description,
      projectId: a.projectId,
      projectName: (a as any).project?.name,
      meetingId: a.meetingId,
      meetingTitle: (a as any).meeting?.title,
      amount: a.amount ?? undefined,
      detectedAt: a.detectedAt.toISOString(),
    }));

    res.json({
      success: true,
      data: {
        kpis: {
          totalHRCost: Math.round(totalHRCost),
          totalMeetings: totalMeetingsResult,
          activeProjects,
          costOverruns,
          costGrowth: 12.4,
          meetingGrowth: 8.2,
        },
        costByProject: Object.values(costByProject).map((p) => ({
          ...p,
          totalCost: Math.round(p.totalCost),
          hoursSpent: Math.round(p.hoursSpent * 10) / 10,
          budgetUtilization:
            Math.round((p.totalCost / p.budget) * 100 * 10) / 10,
        })),
        costByDepartment,
        weeklyTrend,
        recentMeetings: formattedMeetings,
        recentAnomalies: formattedAnomalies,
      },
    });
  } catch (error) {
    next(error);
  }
}
