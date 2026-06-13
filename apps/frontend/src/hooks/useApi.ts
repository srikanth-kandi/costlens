import { useMutation, useQuery } from "@tanstack/react-query";
import {
  attributeMeeting,
  calculateCost,
  createEmployee,
  createMeeting,
  createProject,
  deleteEmployee,
  deleteMeeting,
  deleteProject,
  fetchAnomalies,
  fetchAttributionPrefill,
  fetchDashboard,
  fetchEmployees,
  fetchMeetings,
  fetchProjects,
  updateEmployee,
  updateMeeting,
  updateProject,
} from "@/services/api";
import type {
  AttributionRequest,
  CostCalculationRequest,
  EmployeeUpsertInput,
  MeetingFilters,
  MeetingUpsertInput,
  ProjectUpsertInput,
} from "@costlens/shared";

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    staleTime: 30_000,
  });
}

// ─── Meetings ─────────────────────────────────────────────────────────────────
export function useMeetings(filters: MeetingFilters = {}) {
  return useQuery({
    queryKey: ["meetings", filters],
    queryFn: () => fetchMeetings(filters),
    staleTime: 30_000,
  });
}

export function useCreateMeeting() {
  return useMutation({
    mutationFn: (payload: MeetingUpsertInput) => createMeeting(payload),
  });
}

export function useUpdateMeeting() {
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: MeetingUpsertInput;
    }) => updateMeeting(id, payload),
  });
}

export function useDeleteMeeting() {
  return useMutation({
    mutationFn: (id: number) => deleteMeeting(id),
  });
}

// ─── Projects ─────────────────────────────────────────────────────────────────
export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: 30_000,
  });
}

export function useCreateProject() {
  return useMutation({
    mutationFn: (payload: ProjectUpsertInput) => createProject(payload),
  });
}

export function useUpdateProject() {
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ProjectUpsertInput;
    }) => updateProject(id, payload),
  });
}

export function useDeleteProject() {
  return useMutation({
    mutationFn: (id: number) => deleteProject(id),
  });
}

// ─── Employees ────────────────────────────────────────────────────────────────
export function useEmployees(filters?: { search?: string; department?: string }) {
  return useQuery({
    queryKey: ["employees", filters],
    queryFn: () => fetchEmployees(filters),
    staleTime: 15_000,
  });
}

export function useCreateEmployee() {
  return useMutation({
    mutationFn: (payload: EmployeeUpsertInput) => createEmployee(payload),
  });
}

export function useUpdateEmployee() {
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: EmployeeUpsertInput;
    }) => updateEmployee(id, payload),
  });
}

export function useDeleteEmployee() {
  return useMutation({
    mutationFn: (id: number) => deleteEmployee(id),
  });
}

// ─── Anomalies ────────────────────────────────────────────────────────────────
export function useAnomalies(filters?: {
  type?: string;
  severity?: string;
  projectId?: number;
}) {
  return useQuery({
    queryKey: ["anomalies", filters],
    queryFn: () => fetchAnomalies(filters),
    staleTime: 30_000,
  });
}

// ─── AI Attribution ───────────────────────────────────────────────────────────
export function useAttributeMeeting() {
  return useMutation({
    mutationFn: (request: AttributionRequest) => attributeMeeting(request),
  });
}

export function useAttributionPrefill() {
  return useMutation({
    mutationFn: fetchAttributionPrefill,
  });
}

// ─── Cost Calculation ─────────────────────────────────────────────────────────
export function useCalculateCost() {
  return useMutation({
    mutationFn: (request: CostCalculationRequest) => calculateCost(request),
  });
}
