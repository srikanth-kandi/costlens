import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/database.js";

const employeeInputSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  designation: z.string().trim().min(2),
  department: z.string().trim().min(2),
  hourlyRate: z.number().positive(),
  avatarUrl: z.string().trim().url().optional().nullable(),
});

export async function getEmployees(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { search = "", department = "" } = req.query as Record<
      string,
      string
    >;

    const employees = await prisma.employee.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                  { designation: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
          department
            ? {
                department: { equals: department, mode: "insensitive" },
              }
            : {},
        ],
      },
      orderBy: { name: "asc" },
    });

    res.json({ success: true, data: employees });
  } catch (error) {
    next(error);
  }
}

export async function createEmployee(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = employeeInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid employee payload",
      });
      return;
    }

    const data = {
      ...parsed.data,
      email: parsed.data.email.toLowerCase(),
    };

    const employee = await prisma.employee.create({ data });

    res.status(201).json({ success: true, data: employee });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      res.status(409).json({ success: false, error: "Email already exists" });
      return;
    }
    next(error);
  }
}

export async function updateEmployee(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ success: false, error: "Invalid employee id" });
      return;
    }

    const parsed = employeeInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid employee payload",
      });
      return;
    }

    const exists = await prisma.employee.findUnique({ where: { id } });
    if (!exists) {
      res.status(404).json({ success: false, error: "Employee not found" });
      return;
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...parsed.data,
        email: parsed.data.email.toLowerCase(),
      },
    });

    res.json({ success: true, data: employee });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      res.status(409).json({ success: false, error: "Email already exists" });
      return;
    }
    next(error);
  }
}

export async function deleteEmployee(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ success: false, error: "Invalid employee id" });
      return;
    }

    const exists = await prisma.employee.findUnique({ where: { id } });
    if (!exists) {
      res.status(404).json({ success: false, error: "Employee not found" });
      return;
    }

    await prisma.employee.delete({ where: { id } });

    res.json({ success: true, data: { id } });
  } catch (error) {
    next(error);
  }
}
