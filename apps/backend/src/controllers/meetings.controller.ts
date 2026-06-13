import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database.js";

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

    const where: any = {};

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

    const formatted = meetings.map((m) => {
      const dh = m.durationMinutes / 60;
      const cost = (m.participants as any[]).reduce(
        (sum: number, p: any) => sum + p.employee.hourlyRate * dh,
        0,
      );

      return {
        id: m.id,
        title: m.title,
        description: m.description,
        durationMinutes: m.durationMinutes,
        meetingDate: m.meetingDate.toISOString(),
        projectId: m.projectId,
        projectName: (m as any).project?.name ?? "Unattributed",
        projectCode: (m as any).project?.code ?? null,
        confidenceScore: m.confidenceScore,
        cost: Math.round(cost),
        participants: (m.participants as any[]).map((p) => ({
          meetingId: p.meetingId,
          employeeId: p.employeeId,
          employee: p.employee,
        })),
      };
    });

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
