import { Request, Response, NextFunction } from "express";
import { Meeting, Prisma, Project } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/database.js";
import {
  calculateMeetingCost,
  MeetingParticipantWithEmployee,
} from "../utils/meetingCost.js";

type MeetingWithRelations = Meeting & {
  project: Project | null;
  participants: MeetingParticipantWithEmployee[];
};

const meetingInputSchema = z.object({
  title: z.string().trim().min(2),
  description: z.string().trim().default(""),
  durationMinutes: z.number().int().positive(),
  meetingDate: z.string().datetime(),
  projectId: z.number().int().positive().optional().nullable(),
  confidenceScore: z.number().min(0).max(100).optional(),
  participantEmployeeIds: z.array(z.number().int().positive()).min(1),
});

async function calculateCostFromEmployees(
  employeeIds: number[],
  durationMinutes: number,
): Promise<number> {
  const employees = await prisma.employee.findMany({
    where: { id: { in: employeeIds } },
    select: { hourlyRate: true },
  });

  const durationHours = durationMinutes / 60;
  return employees.reduce(
    (sum, employee) => sum + employee.hourlyRate * durationHours,
    0,
  );
}

export async function getMeetings(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const {
      search = "",
      projectId,
      department,
      dateFrom,
      dateTo,
      page = "1",
      pageSize = "20",
    } = req.query as Record<string, string>;

    const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
    const take = parseInt(pageSize, 10);

    const where: Prisma.MeetingWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (projectId) {
      where.projectId = parseInt(projectId, 10);
    }

    if (dateFrom || dateTo) {
      where.meetingDate = {};
      if (dateFrom) where.meetingDate.gte = new Date(dateFrom);
      if (dateTo) where.meetingDate.lte = new Date(dateTo);
    }

    if (department) {
      where.participants = {
        some: {
          employee: { department: { equals: department, mode: "insensitive" } },
        },
      };
    }

    const [meetings, total] = await Promise.all([
      prisma.meeting.findMany({
        where,
        include: {
          project: true,
          participants: { include: { employee: true } },
        },
        orderBy: { meetingDate: "desc" },
        skip,
        take,
      }),
      prisma.meeting.count({ where }),
    ]);

    const formatted = (meetings as MeetingWithRelations[]).map(
      (m: MeetingWithRelations) => {
      const cost = calculateMeetingCost(m.durationMinutes, m.participants);

      return {
        id: m.id,
        title: m.title,
        description: m.description,
        durationMinutes: m.durationMinutes,
        meetingDate: m.meetingDate.toISOString(),
        projectId: m.projectId,
        projectName: m.project?.name ?? "Unattributed",
        projectCode: m.project?.code ?? null,
        confidenceScore: m.confidenceScore,
        cost: Math.round(cost),
        participants: m.participants.map((p: MeetingParticipantWithEmployee) => ({
          meetingId: p.meetingId,
          employeeId: p.employeeId,
          employee: p.employee,
        })),
      };
    },
    );

    res.json({
      success: true,
      data: formatted,
      total,
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
    });
  } catch (error) {
    next(error);
  }
}

export async function createMeeting(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = meetingInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid meeting payload",
      });
      return;
    }

    const payload = parsed.data;
    const uniqueEmployeeIds = [...new Set(payload.participantEmployeeIds)];

    const cost = await calculateCostFromEmployees(
      uniqueEmployeeIds,
      payload.durationMinutes,
    );

    const meeting = await prisma.meeting.create({
      data: {
        title: payload.title.trim(),
        description: payload.description.trim(),
        durationMinutes: payload.durationMinutes,
        meetingDate: new Date(payload.meetingDate),
        projectId: payload.projectId ?? null,
        confidenceScore: payload.confidenceScore ?? 80,
        cost,
      },
    });

    await prisma.meetingParticipant.createMany({
      data: uniqueEmployeeIds.map((employeeId) => ({
        meetingId: meeting.id,
        employeeId,
      })),
      skipDuplicates: true,
    });

    res.status(201).json({ success: true, data: meeting });
  } catch (error) {
    next(error);
  }
}

export async function updateMeeting(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ success: false, error: "Invalid meeting ID" });
      return;
    }

    const parsed = meetingInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid meeting payload",
      });
      return;
    }

    const exists = await prisma.meeting.findUnique({ where: { id } });
    if (!exists) {
      res.status(404).json({ success: false, error: "Meeting not found" });
      return;
    }

    const payload = parsed.data;
    const uniqueEmployeeIds = [...new Set(payload.participantEmployeeIds)];

    const cost = await calculateCostFromEmployees(
      uniqueEmployeeIds,
      payload.durationMinutes,
    );

    const meeting = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.meeting.update({
        where: { id },
        data: {
          title: payload.title.trim(),
          description: payload.description.trim(),
          durationMinutes: payload.durationMinutes,
          meetingDate: new Date(payload.meetingDate),
          projectId: payload.projectId ?? null,
          confidenceScore: payload.confidenceScore ?? 80,
          cost,
        },
      });

      await tx.meetingParticipant.deleteMany({ where: { meetingId: id } });
      await tx.meetingParticipant.createMany({
        data: uniqueEmployeeIds.map((employeeId) => ({
          meetingId: id,
          employeeId,
        })),
        skipDuplicates: true,
      });

      return updated;
    });

    res.json({ success: true, data: meeting });
  } catch (error) {
    next(error);
  }
}

export async function deleteMeeting(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ success: false, error: "Invalid meeting ID" });
      return;
    }

    const exists = await prisma.meeting.findUnique({ where: { id } });
    if (!exists) {
      res.status(404).json({ success: false, error: "Meeting not found" });
      return;
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.anomaly.deleteMany({ where: { meetingId: id } });
      await tx.meetingParticipant.deleteMany({ where: { meetingId: id } });
      await tx.meeting.delete({ where: { id } });
    });

    res.json({ success: true, data: { id } });
  } catch (error) {
    next(error);
  }
}
