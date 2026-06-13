import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  FolderKanban,
  Pencil,
  Plus,
  Trash2,
  UsersRound,
} from "lucide-react";
import {
  useCreateEmployee,
  useCreateMeeting,
  useCreateProject,
  useDeleteEmployee,
  useDeleteMeeting,
  useDeleteProject,
  useEmployees,
  useMeetings,
  useProjects,
  useUpdateEmployee,
  useUpdateMeeting,
  useUpdateProject,
} from "@/hooks/useApi";
import type {
  EmployeeUpsertInput,
  Meeting,
  MeetingUpsertInput,
  Project,
  ProjectUpsertInput,
} from "@costlens/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { Select } from "@/components/ui/select";

type AdminSection = "employees" | "projects" | "meetings";

type ProjectFieldError =
  | "name"
  | "code"
  | "budget"
  | "teamSize"
  | "startDate"
  | "endDate";

type MeetingFieldError =
  | "title"
  | "durationMinutes"
  | "meetingDate"
  | "confidenceScore"
  | "participantIdsCsv";

const SECTION_META: Record<
  AdminSection,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  employees: { label: "Employees", icon: UsersRound },
  projects: { label: "Projects", icon: FolderKanban },
  meetings: { label: "Meetings", icon: CalendarDays },
};

const EMPTY_EMPLOYEE_FORM: EmployeeUpsertInput = {
  name: "",
  email: "",
  designation: "",
  department: "",
  hourlyRate: 0,
  avatarUrl: null,
};

const EMPTY_PROJECT_FORM: ProjectUpsertInput = {
  name: "",
  code: "",
  description: "",
  budget: 0,
  status: "active",
  teamSize: null,
  startDate: null,
  endDate: null,
};

const EMPTY_MEETING_FORM = {
  title: "",
  description: "",
  durationMinutes: 60,
  meetingDate: "",
  projectId: "",
  confidenceScore: 80,
  participantIdsCsv: "",
};

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
  { value: "at_risk", label: "At Risk" },
] as const;

const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;

function toLocalDateTimeInput(dateIso?: string): string {
  if (!dateIso) return "";
  const date = new Date(dateIso);
  const tzOffsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

function parseParticipantIds(csv: string): number[] {
  return [
    ...new Set(
      csv
        .split(",")
        .map((token) => Number(token.trim()))
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  ];
}

function validateProjectForm(
  form: ProjectUpsertInput,
): Partial<Record<ProjectFieldError, string>> {
  const errors: Partial<Record<ProjectFieldError, string>> = {};

  if (!form.name.trim()) {
    errors.name = "Project name is required.";
  }
  if (!form.code.trim()) {
    errors.code = "Project code is required.";
  }
  if (!(Number(form.budget) > 0)) {
    errors.budget = "Budget must be greater than 0.";
  }
  if (form.teamSize !== null && form.teamSize !== undefined && Number(form.teamSize) < 1) {
    errors.teamSize = "Team size must be at least 1 when provided.";
  }

  const hasStart = Boolean(form.startDate);
  const hasEnd = Boolean(form.endDate);
  const start = hasStart ? new Date(form.startDate as string) : null;
  const end = hasEnd ? new Date(form.endDate as string) : null;

  if (start && Number.isNaN(start.getTime())) {
    errors.startDate = "Start date is invalid.";
  }
  if (end && Number.isNaN(end.getTime())) {
    errors.endDate = "End date is invalid.";
  }
  if (start && end && start.getTime() > end.getTime()) {
    errors.endDate = "End date cannot be before start date.";
  }

  return errors;
}

function validateMeetingForm(
  form: typeof EMPTY_MEETING_FORM,
): Partial<Record<MeetingFieldError, string>> {
  const errors: Partial<Record<MeetingFieldError, string>> = {};
  const duration = Number(form.durationMinutes);
  const confidence = Number(form.confidenceScore);
  const parsedDate = form.meetingDate ? new Date(form.meetingDate) : null;

  if (!form.title.trim()) {
    errors.title = "Meeting title is required.";
  }
  if (!Number.isFinite(duration) || duration < 15 || duration > 600) {
    errors.durationMinutes = "Duration must be between 15 and 600 minutes.";
  }
  if (!form.meetingDate) {
    errors.meetingDate = "Meeting date is required.";
  } else if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
    errors.meetingDate = "Meeting date is invalid.";
  }
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 100) {
    errors.confidenceScore = "Confidence score must be between 0 and 100.";
  }
  if (parseParticipantIds(form.participantIdsCsv).length === 0) {
    errors.participantIdsCsv = "Add at least one valid participant employee ID.";
  }

  return errors;
}

export default function HRAdmin() {
  const queryClient = useQueryClient();
  const [section, setSection] = useState<AdminSection>("employees");

  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeDepartment, setEmployeeDepartment] = useState("");
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null);
  const [employeeForm, setEmployeeForm] =
    useState<EmployeeUpsertInput>(EMPTY_EMPLOYEE_FORM);

  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [projectForm, setProjectForm] =
    useState<ProjectUpsertInput>(EMPTY_PROJECT_FORM);
  const [projectErrors, setProjectErrors] = useState<
    Partial<Record<ProjectFieldError, string>>
  >({});
  const [projectSearch, setProjectSearch] = useState("");
  const [projectStatusFilter, setProjectStatusFilter] = useState("");
  const [projectPage, setProjectPage] = useState(1);
  const [projectPageSize, setProjectPageSize] = useState<number>(10);

  const [editingMeetingId, setEditingMeetingId] = useState<number | null>(null);
  const [meetingForm, setMeetingForm] = useState(EMPTY_MEETING_FORM);
  const [meetingErrors, setMeetingErrors] = useState<
    Partial<Record<MeetingFieldError, string>>
  >({});
  const [meetingSearch, setMeetingSearch] = useState("");
  const [meetingProjectFilter, setMeetingProjectFilter] = useState("");
  const [meetingPage, setMeetingPage] = useState(1);
  const [meetingPageSize, setMeetingPageSize] = useState<number>(10);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const employeeFilters = useMemo(
    () => ({
      search: employeeSearch.trim() || undefined,
      department: employeeDepartment.trim() || undefined,
    }),
    [employeeSearch, employeeDepartment],
  );

  const { data: employees = [], isLoading: isEmployeesLoading } =
    useEmployees(employeeFilters);
  const { data: projects = [], isLoading: isProjectsLoading } = useProjects();
  const { data: meetingsResponse, isLoading: isMeetingsLoading } = useMeetings({
    page: 1,
    pageSize: 100,
  });
  const meetingsData = meetingsResponse?.data;
  const meetings = useMemo(() => meetingsData ?? [], [meetingsData]);

  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const createMeeting = useCreateMeeting();
  const updateMeeting = useUpdateMeeting();
  const deleteMeeting = useDeleteMeeting();

  const filteredProjects = useMemo(() => {
    const searchTerm = projectSearch.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesSearch =
        !searchTerm ||
        project.name.toLowerCase().includes(searchTerm) ||
        project.code.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm);
      const matchesStatus =
        !projectStatusFilter || project.status === projectStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projectSearch, projectStatusFilter, projects]);

  const totalProjectPages = Math.max(
    1,
    Math.ceil(filteredProjects.length / projectPageSize),
  );
  const safeProjectPage = Math.min(projectPage, totalProjectPages);
  const paginatedProjects = useMemo(() => {
    const start = (safeProjectPage - 1) * projectPageSize;
    return filteredProjects.slice(start, start + projectPageSize);
  }, [filteredProjects, projectPageSize, safeProjectPage]);

  const filteredMeetings = useMemo(() => {
    const searchTerm = meetingSearch.trim().toLowerCase();
    return meetings.filter((meeting) => {
      const matchesSearch =
        !searchTerm ||
        meeting.title.toLowerCase().includes(searchTerm) ||
        (meeting.description ?? "").toLowerCase().includes(searchTerm) ||
        (meeting.projectName ?? "").toLowerCase().includes(searchTerm);
      const matchesProject =
        !meetingProjectFilter || String(meeting.projectId ?? "") === meetingProjectFilter;
      return matchesSearch && matchesProject;
    });
  }, [meetingProjectFilter, meetingSearch, meetings]);

  const totalMeetingPages = Math.max(
    1,
    Math.ceil(filteredMeetings.length / meetingPageSize),
  );
  const safeMeetingPage = Math.min(meetingPage, totalMeetingPages);
  const paginatedMeetings = useMemo(() => {
    const start = (safeMeetingPage - 1) * meetingPageSize;
    return filteredMeetings.slice(start, start + meetingPageSize);
  }, [filteredMeetings, meetingPageSize, safeMeetingPage]);

  const isSubmitting =
    createEmployee.isPending ||
    updateEmployee.isPending ||
    createProject.isPending ||
    updateProject.isPending ||
    createMeeting.isPending ||
    updateMeeting.isPending;

  const refreshAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["employees"] }),
      queryClient.invalidateQueries({ queryKey: ["projects"] }),
      queryClient.invalidateQueries({ queryKey: ["meetings"] }),
    ]);
  };

  const resetEmployeeForm = () => {
    setEditingEmployeeId(null);
    setEmployeeForm(EMPTY_EMPLOYEE_FORM);
  };

  const resetProjectForm = () => {
    setEditingProjectId(null);
    setProjectForm(EMPTY_PROJECT_FORM);
    setProjectErrors({});
  };

  const resetMeetingForm = () => {
    setEditingMeetingId(null);
    setMeetingForm(EMPTY_MEETING_FORM);
    setMeetingErrors({});
  };

  const withErrorHandling = async (task: () => Promise<void>, message: string) => {
    setErrorMessage(null);
    try {
      await task();
    } catch {
      setErrorMessage(message);
    }
  };

  const handleEmployeeSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload: EmployeeUpsertInput = {
      ...employeeForm,
      name: employeeForm.name.trim(),
      email: employeeForm.email.trim().toLowerCase(),
      designation: employeeForm.designation.trim(),
      department: employeeForm.department.trim(),
      avatarUrl: employeeForm.avatarUrl?.trim() ? employeeForm.avatarUrl.trim() : null,
    };

    await withErrorHandling(async () => {
      if (editingEmployeeId) {
        await updateEmployee.mutateAsync({ id: editingEmployeeId, payload });
      } else {
        await createEmployee.mutateAsync(payload);
      }
      await refreshAll();
      resetEmployeeForm();
    }, "Could not save employee.");
  };

  const handleProjectSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateProjectForm(projectForm);
    setProjectErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setErrorMessage("Please fix project form errors.");
      return;
    }

    const payload: ProjectUpsertInput = {
      ...projectForm,
      name: projectForm.name.trim(),
      code: projectForm.code.trim().toUpperCase(),
      description: projectForm.description.trim(),
      budget: Number(projectForm.budget) || 0,
      teamSize: projectForm.teamSize ? Number(projectForm.teamSize) : null,
      startDate: projectForm.startDate || null,
      endDate: projectForm.endDate || null,
    };

    await withErrorHandling(async () => {
      if (editingProjectId) {
        await updateProject.mutateAsync({ id: editingProjectId, payload });
      } else {
        await createProject.mutateAsync(payload);
      }
      await refreshAll();
      resetProjectForm();
    }, "Could not save project.");
  };

  const handleMeetingSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateMeetingForm(meetingForm);
    setMeetingErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setErrorMessage("Please fix meeting form errors.");
      return;
    }

    const participantEmployeeIds = parseParticipantIds(meetingForm.participantIdsCsv);

    const payload: MeetingUpsertInput = {
      title: meetingForm.title.trim(),
      description: meetingForm.description.trim(),
      durationMinutes: Number(meetingForm.durationMinutes),
      meetingDate: new Date(meetingForm.meetingDate).toISOString(),
      projectId: meetingForm.projectId ? Number(meetingForm.projectId) : null,
      confidenceScore: Number(meetingForm.confidenceScore),
      participantEmployeeIds,
    };

    await withErrorHandling(async () => {
      if (editingMeetingId) {
        await updateMeeting.mutateAsync({ id: editingMeetingId, payload });
      } else {
        await createMeeting.mutateAsync(payload);
      }
      await refreshAll();
      resetMeetingForm();
    }, "Could not save meeting.");
  };

  const askDelete = async (
    type: "employee" | "project" | "meeting",
    id: number,
    action: () => Promise<void>,
  ) => {
    if (!window.confirm(`Delete this ${type}? This action cannot be undone.`)) {
      return;
    }

    await withErrorHandling(async () => {
      await action();
      await refreshAll();
      if (type === "employee" && editingEmployeeId === id) resetEmployeeForm();
      if (type === "project" && editingProjectId === id) resetProjectForm();
      if (type === "meeting" && editingMeetingId === id) resetMeetingForm();
    }, `Could not delete ${type}.`);
  };

  const loadProjectForEdit = (project: Project) => {
    setEditingProjectId(project.id);
    setProjectErrors({});
    setProjectForm({
      name: project.name,
      code: project.code,
      description: project.description,
      budget: project.budget,
      status: project.status,
      teamSize: project.teamSize ?? null,
      startDate: project.startDate?.slice(0, 10) ?? null,
      endDate: project.endDate?.slice(0, 10) ?? null,
    });
  };

  const loadMeetingForEdit = (meeting: Meeting) => {
    setEditingMeetingId(meeting.id);
    setMeetingErrors({});
    setMeetingForm({
      title: meeting.title,
      description: meeting.description,
      durationMinutes: meeting.durationMinutes,
      meetingDate: toLocalDateTimeInput(meeting.meetingDate),
      projectId: meeting.projectId ? String(meeting.projectId) : "",
      confidenceScore: Math.round(meeting.confidenceScore ?? 80),
      participantIdsCsv: (meeting.participants ?? [])
        .map((p) => p.employeeId)
        .join(", "),
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersRound className="w-5 h-5 text-blue-600" />
            Admin Data Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SECTION_META) as AdminSection[]).map((key) => {
              const Icon = SECTION_META[key].icon;
              return (
                <Button
                  key={key}
                  type="button"
                  variant={section === key ? "default" : "secondary"}
                  onClick={() => {
                    setErrorMessage(null);
                    setSection(key);
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {SECTION_META[key].label}
                </Button>
              );
            })}
          </div>
          {errorMessage && <p className="text-sm text-red-600 mt-3">{errorMessage}</p>}
        </CardContent>
      </Card>

      {section === "employees" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                {editingEmployeeId ? "Edit Employee" : "Add Employee"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    value={employeeForm.name}
                    onChange={(e) =>
                      setEmployeeForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Name"
                  />
                  <Input
                    type="email"
                    value={employeeForm.email}
                    onChange={(e) =>
                      setEmployeeForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="Email"
                  />
                  <Input
                    value={employeeForm.designation}
                    onChange={(e) =>
                      setEmployeeForm((prev) => ({ ...prev, designation: e.target.value }))
                    }
                    placeholder="Designation"
                  />
                  <Input
                    value={employeeForm.department}
                    onChange={(e) =>
                      setEmployeeForm((prev) => ({ ...prev, department: e.target.value }))
                    }
                    placeholder="Department"
                  />
                  <Input
                    type="number"
                    min={1}
                    value={employeeForm.hourlyRate || ""}
                    onChange={(e) =>
                      setEmployeeForm((prev) => ({
                        ...prev,
                        hourlyRate: Number(e.target.value) || 0,
                      }))
                    }
                    placeholder="Hourly Rate"
                  />
                  <Input
                    value={employeeForm.avatarUrl ?? ""}
                    onChange={(e) =>
                      setEmployeeForm((prev) => ({ ...prev, avatarUrl: e.target.value }))
                    }
                    placeholder="Avatar URL (optional)"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    <Plus className="w-4 h-4" />
                    {editingEmployeeId ? "Update" : "Create"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={resetEmployeeForm}>
                    Clear
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employees</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Search employees"
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                />
                <Input
                  placeholder="Filter by department"
                  value={employeeDepartment}
                  onChange={(e) => setEmployeeDepartment(e.target.value)}
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isEmployeesLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : (
                    employees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>{employee.name}</TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(employee.hourlyRate)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setEditingEmployeeId(employee.id);
                                setEmployeeForm({
                                  name: employee.name,
                                  email: employee.email,
                                  designation: employee.designation,
                                  department: employee.department,
                                  hourlyRate: employee.hourlyRate,
                                  avatarUrl: employee.avatarUrl ?? null,
                                });
                              }}
                            >
                              <Pencil className="w-3 h-3" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                askDelete("employee", employee.id, () =>
                                  deleteEmployee.mutateAsync(employee.id).then(() => undefined),
                                )
                              }
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {section === "projects" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{editingProjectId ? "Edit Project" : "Add Project"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProjectSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    value={projectForm.name}
                    onChange={(e) =>
                      setProjectForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Project Name"
                  />
                  {projectErrors.name && (
                    <p className="text-xs text-red-600 -mt-2">{projectErrors.name}</p>
                  )}
                  <Input
                    value={projectForm.code}
                    onChange={(e) =>
                      setProjectForm((prev) => ({ ...prev, code: e.target.value }))
                    }
                    placeholder="Project Code"
                  />
                  {projectErrors.code && (
                    <p className="text-xs text-red-600 -mt-2">{projectErrors.code}</p>
                  )}
                  <Input
                    value={projectForm.description}
                    onChange={(e) =>
                      setProjectForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Description"
                  />
                  <Input
                    type="number"
                    min={1}
                    value={projectForm.budget || ""}
                    onChange={(e) =>
                      setProjectForm((prev) => ({
                        ...prev,
                        budget: Number(e.target.value) || 0,
                      }))
                    }
                    placeholder="Budget"
                  />
                  {projectErrors.budget && (
                    <p className="text-xs text-red-600 -mt-2">{projectErrors.budget}</p>
                  )}
                  <Select
                    value={projectForm.status}
                    onChange={(e) =>
                      setProjectForm((prev) => ({
                        ...prev,
                        status: e.target.value as ProjectUpsertInput["status"],
                      }))
                    }
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </Select>
                  <Input
                    type="number"
                    min={1}
                    value={projectForm.teamSize ?? ""}
                    onChange={(e) =>
                      setProjectForm((prev) => ({
                        ...prev,
                        teamSize: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                    placeholder="Team Size"
                  />
                  {projectErrors.teamSize && (
                    <p className="text-xs text-red-600 -mt-2">{projectErrors.teamSize}</p>
                  )}
                  <Input
                    type="date"
                    value={projectForm.startDate ?? ""}
                    onChange={(e) =>
                      setProjectForm((prev) => ({
                        ...prev,
                        startDate: e.target.value || null,
                      }))
                    }
                  />
                  {projectErrors.startDate && (
                    <p className="text-xs text-red-600 -mt-2">{projectErrors.startDate}</p>
                  )}
                  <Input
                    type="date"
                    value={projectForm.endDate ?? ""}
                    onChange={(e) =>
                      setProjectForm((prev) => ({
                        ...prev,
                        endDate: e.target.value || null,
                      }))
                    }
                  />
                  {projectErrors.endDate && (
                    <p className="text-xs text-red-600 -mt-2">{projectErrors.endDate}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    <Plus className="w-4 h-4" />
                    {editingProjectId ? "Update" : "Create"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={resetProjectForm}>
                    Clear
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  placeholder="Search projects"
                  value={projectSearch}
                  onChange={(e) => {
                    setProjectSearch(e.target.value);
                    setProjectPage(1);
                  }}
                />
                <Select
                  value={projectStatusFilter}
                  onChange={(e) => {
                    setProjectStatusFilter(e.target.value);
                    setProjectPage(1);
                  }}
                >
                  <option value="">All statuses</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Select>
                <Select
                  value={String(projectPageSize)}
                  onChange={(e) => {
                    setProjectPageSize(Number(e.target.value) || 10);
                    setProjectPage(1);
                  }}
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size} per page
                    </option>
                  ))}
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isProjectsLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : paginatedProjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No projects found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>{project.name}</TableCell>
                        <TableCell>{project.code}</TableCell>
                        <TableCell>{project.status}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(project.budget)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => loadProjectForEdit(project)}
                            >
                              <Pencil className="w-3 h-3" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                askDelete("project", project.id, () =>
                                  deleteProject.mutateAsync(project.id).then(() => undefined),
                                )
                              }
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Showing {paginatedProjects.length} of {filteredProjects.length} projects
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={safeProjectPage <= 1}
                    onClick={() => setProjectPage((prev) => Math.max(1, prev - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-slate-600">
                    Page {safeProjectPage} of {totalProjectPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={safeProjectPage >= totalProjectPages}
                    onClick={() =>
                      setProjectPage((prev) => Math.min(totalProjectPages, prev + 1))
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {section === "meetings" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{editingMeetingId ? "Edit Meeting" : "Add Meeting"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMeetingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    value={meetingForm.title}
                    onChange={(e) =>
                      setMeetingForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Meeting Title"
                  />
                  {meetingErrors.title && (
                    <p className="text-xs text-red-600 -mt-2">{meetingErrors.title}</p>
                  )}
                  <Input
                    type="number"
                    min={15}
                    value={meetingForm.durationMinutes}
                    onChange={(e) =>
                      setMeetingForm((prev) => ({
                        ...prev,
                        durationMinutes: Number(e.target.value) || 60,
                      }))
                    }
                    placeholder="Duration (minutes)"
                  />
                  {meetingErrors.durationMinutes && (
                    <p className="text-xs text-red-600 -mt-2">
                      {meetingErrors.durationMinutes}
                    </p>
                  )}
                  <Input
                    value={meetingForm.description}
                    onChange={(e) =>
                      setMeetingForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Description"
                  />
                  <Input
                    type="datetime-local"
                    value={meetingForm.meetingDate}
                    onChange={(e) =>
                      setMeetingForm((prev) => ({ ...prev, meetingDate: e.target.value }))
                    }
                  />
                  {meetingErrors.meetingDate && (
                    <p className="text-xs text-red-600 -mt-2">{meetingErrors.meetingDate}</p>
                  )}
                  <Select
                    value={meetingForm.projectId}
                    onChange={(e) =>
                      setMeetingForm((prev) => ({ ...prev, projectId: e.target.value }))
                    }
                  >
                    <option value="">Unattributed</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.code} - {project.name}
                      </option>
                    ))}
                  </Select>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={meetingForm.confidenceScore}
                    onChange={(e) =>
                      setMeetingForm((prev) => ({
                        ...prev,
                        confidenceScore: Number(e.target.value) || 0,
                      }))
                    }
                    placeholder="Confidence Score"
                  />
                  {meetingErrors.confidenceScore && (
                    <p className="text-xs text-red-600 -mt-2">
                      {meetingErrors.confidenceScore}
                    </p>
                  )}
                </div>
                <Input
                  value={meetingForm.participantIdsCsv}
                  onChange={(e) =>
                    setMeetingForm((prev) => ({
                      ...prev,
                      participantIdsCsv: e.target.value,
                    }))
                  }
                  placeholder="Participant Employee IDs (comma separated, e.g. 1,2,3)"
                />
                {meetingErrors.participantIdsCsv && (
                  <p className="text-xs text-red-600 -mt-2">
                    {meetingErrors.participantIdsCsv}
                  </p>
                )}
                <div className="text-xs text-slate-500">
                  Available employee IDs: {employees.map((e) => `${e.id}`).join(", ")}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    <Plus className="w-4 h-4" />
                    {editingMeetingId ? "Update" : "Create"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={resetMeetingForm}>
                    Clear
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meetings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  placeholder="Search meetings"
                  value={meetingSearch}
                  onChange={(e) => {
                    setMeetingSearch(e.target.value);
                    setMeetingPage(1);
                  }}
                />
                <Select
                  value={meetingProjectFilter}
                  onChange={(e) => {
                    setMeetingProjectFilter(e.target.value);
                    setMeetingPage(1);
                  }}
                >
                  <option value="">All projects</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.code} - {project.name}
                    </option>
                  ))}
                </Select>
                <Select
                  value={String(meetingPageSize)}
                  onChange={(e) => {
                    setMeetingPageSize(Number(e.target.value) || 10);
                    setMeetingPage(1);
                  }}
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size} per page
                    </option>
                  ))}
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isMeetingsLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : paginatedMeetings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No meetings found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedMeetings.map((meeting) => (
                      <TableRow key={meeting.id}>
                        <TableCell>{meeting.title}</TableCell>
                        <TableCell>{meeting.projectName ?? "Unattributed"}</TableCell>
                        <TableCell>{formatDate(meeting.meetingDate)}</TableCell>
                        <TableCell>{meeting.participants?.length ?? 0}</TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => loadMeetingForEdit(meeting)}
                            >
                              <Pencil className="w-3 h-3" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                askDelete("meeting", meeting.id, () =>
                                  deleteMeeting.mutateAsync(meeting.id).then(() => undefined),
                                )
                              }
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Showing {paginatedMeetings.length} of {filteredMeetings.length} meetings
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={safeMeetingPage <= 1}
                    onClick={() => setMeetingPage((prev) => Math.max(1, prev - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-slate-600">
                    Page {safeMeetingPage} of {totalMeetingPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={safeMeetingPage >= totalMeetingPages}
                    onClick={() =>
                      setMeetingPage((prev) => Math.min(totalMeetingPages, prev + 1))
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
