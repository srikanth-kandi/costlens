import { z } from "zod";

export const AttributionRequestSchema = z.object({
  title: z.string().min(1, "Meeting title is required"),
  description: z.string().optional().default(""),
  attendees: z.array(z.string()).min(1, "At least one attendee is required"),
});

export const CostCalculationSchema = z.object({
  employeeIds: z.array(z.number()).min(1, "At least one employee is required"),
  durationMinutes: z.number().min(1, "Duration must be at least 1 minute"),
});

export const MeetingFiltersSchema = z.object({
  search: z.string().optional(),
  projectId: z.coerce.number().optional(),
  department: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(20),
});

export type AttributionRequestInput = z.infer<typeof AttributionRequestSchema>;
export type CostCalculationInput = z.infer<typeof CostCalculationSchema>;
export type MeetingFiltersInput = z.infer<typeof MeetingFiltersSchema>;
