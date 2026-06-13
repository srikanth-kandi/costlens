import { Request, Response, NextFunction } from "express";
import { Anomaly, Meeting, Prisma, Project } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/database.js";
import {
  calculateMeetingCost,
  MeetingParticipantWithEmployee,
  minutesToHours,
  roundToOneDecimal,
} from "../utils/meetingCost.js";

type ProjectWithRelations = Project & {
  meetings: (Meeting & { participants: MeetingParticipantWithEmployee[] })[];
  anomalies: Anomaly[];
};

const projectInputSchema = z.object({
  name: z.string().trim().min(2),
  code: z.string().trim().min(2),
  description: z.string().trim().default(""),
  budget: z.number().positive(),
  status: z.enum([
    "active",
    "on_hold",
    "completed",
    "at_risk",
    "on-hold",
    "at-risk",
  ]),
  teamSize: z.number().int().positive().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

function normalizeProjectStatus(status: string):
  | "active"
  | "on_hold"
  | "completed"
  | "at_risk" {
  if (status === "on-hold") return "on_hold";
  if (status === "at-risk") return "at_risk";
  return status as "active" | "on_hold" | "completed" | "at_risk";
}

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

    const formatted = (projects as ProjectWithRelations[]).map(
      (project: ProjectWithRelations) => {
      let totalCost = 0;
      let hoursSpent = 0;

      for (const meeting of project.meetings) {
        const dh = minutesToHours(meeting.durationMinutes);
        hoursSpent += dh;
        totalCost += calculateMeetingCost(meeting.durationMinutes, meeting.participants);
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
        hoursSpent: roundToOneDecimal(hoursSpent),
        budgetUtilization: Math.round(budgetUtilization * 10) / 10,
        anomalyCount: project.anomalies.length,
      };
    },
    );

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

      const weekMeetings = (project.meetings as (Meeting & {
        participants: MeetingParticipantWithEmployee[];
      })[]).filter((m: Meeting & { participants: MeetingParticipantWithEmployee[] }) => {
        const d = new Date(m.meetingDate);
        return d >= weekStart && d <= weekEnd;
      });

      let weekCost = 0;
      for (const meeting of weekMeetings) {
        weekCost += calculateMeetingCost(
          meeting.durationMinutes,
          meeting.participants,
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
    for (const meeting of project.meetings as (Meeting & {
      participants: MeetingParticipantWithEmployee[];
    })[]) {
      const dh = minutesToHours(meeting.durationMinutes);
      hoursSpent += dh;
      totalCost += calculateMeetingCost(meeting.durationMinutes, meeting.participants);
    }

    res.json({
      success: true,
      data: {
        ...project,
        startDate: project.startDate?.toISOString(),
        endDate: project.endDate?.toISOString(),
        totalCost: Math.round(totalCost),
        hoursSpent: roundToOneDecimal(hoursSpent),
        budgetUtilization:
          Math.round((totalCost / project.budget) * 100 * 10) / 10,
        weeklyTrend,
        meetings: project.meetings.map((m) => ({
          ...m,
          meetingDate: m.meetingDate.toISOString(),
          cost: m.cost ?? 0,
          participants: (m.participants as MeetingParticipantWithEmployee[]).map((p: MeetingParticipantWithEmployee) => ({
            meetingId: p.meetingId,
            employeeId: p.employeeId,
            employee: p.employee,
          })),
        })),
        anomalies: project.anomalies.map((a: Anomaly) => ({
          ...a,
          detectedAt: a.detectedAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = projectInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid project payload",
      });
      return;
    }

    const payload = parsed.data;
    const project = await prisma.project.create({
      data: {
        name: payload.name.trim(),
        code: payload.code.trim().toUpperCase(),
        description: payload.description.trim(),
        budget: payload.budget,
        status: normalizeProjectStatus(payload.status),
        teamSize: payload.teamSize ?? null,
        startDate: payload.startDate ? new Date(payload.startDate) : null,
        endDate: payload.endDate ? new Date(payload.endDate) : null,
      },
    });

    res.status(201).json({ success: true, data: project });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      res.status(409).json({ success: false, error: "Project code already exists" });
      return;
    }
    next(error);
  }
}

export async function updateProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ success: false, error: "Invalid project ID" });
      return;
    }

    const parsed = projectInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid project payload",
      });
      return;
    }

    const exists = await prisma.project.findUnique({ where: { id } });
    if (!exists) {
      res.status(404).json({ success: false, error: "Project not found" });
      return;
    }

    const payload = parsed.data;
    const project = await prisma.project.update({
      where: { id },
      data: {
        name: payload.name.trim(),
        code: payload.code.trim().toUpperCase(),
        description: payload.description.trim(),
        budget: payload.budget,
        status: normalizeProjectStatus(payload.status),
        teamSize: payload.teamSize ?? null,
        startDate: payload.startDate ? new Date(payload.startDate) : null,
        endDate: payload.endDate ? new Date(payload.endDate) : null,
      },
    });

    res.json({ success: true, data: project });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      res.status(409).json({ success: false, error: "Project code already exists" });
      return;
    }
    next(error);
  }
}

export async function deleteProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ success: false, error: "Invalid project ID" });
      return;
    }

    const exists = await prisma.project.findUnique({ where: { id } });
    if (!exists) {
      res.status(404).json({ success: false, error: "Project not found" });
      return;
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const projectMeetings = await tx.meeting.findMany({
        where: { projectId: id },
        select: { id: true },
      });
      const meetingIds = projectMeetings.map((m: { id: number }) => m.id);

      if (meetingIds.length > 0) {
        await tx.anomaly.deleteMany({ where: { meetingId: { in: meetingIds } } });
        await tx.meetingParticipant.deleteMany({
          where: { meetingId: { in: meetingIds } },
        });
      }

      await tx.meeting.deleteMany({ where: { projectId: id } });
      await tx.anomaly.deleteMany({ where: { projectId: id } });
      await tx.costSummary.deleteMany({ where: { projectId: id } });
      await tx.project.delete({ where: { id } });
    });

    res.json({ success: true, data: { id } });
  } catch (error) {
    next(error);
  }
}
