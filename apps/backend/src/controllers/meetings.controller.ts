import { Request, Response, NextFunction } from "express";
import { Meeting, Prisma, Project } from "@prisma/client";
import { prisma } from "../config/database.js";
import {
  calculateMeetingCost,
  MeetingParticipantWithEmployee,
} from "../utils/meetingCost.js";

type MeetingWithRelations = Meeting & {
  project: Project | null;
  participants: MeetingParticipantWithEmployee[];
};

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
