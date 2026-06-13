import { Employee, MeetingParticipant } from "@prisma/client";

export type MeetingParticipantWithEmployee = MeetingParticipant & {
  employee: Employee;
};

export function minutesToHours(durationMinutes: number): number {
  return durationMinutes / 60;
}

export function calculateMeetingCost(
  durationMinutes: number,
  participants: MeetingParticipantWithEmployee[],
): number {
  const durationHours = minutesToHours(durationMinutes);
  return participants.reduce(
    (sum: number, participant: MeetingParticipantWithEmployee) =>
      sum + participant.employee.hourlyRate * durationHours,
    0,
  );
}

export function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}
