import { useState } from "react";
import { Search, Filter, Users } from "lucide-react";
import { useMeetings } from "@/hooks/useApi";
import { mockMeetings, mockProjects } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatCurrency,
  formatDate,
  formatDuration,
  getConfidenceColor,
  getConfidenceBg,
  truncate,
} from "@/utils/formatters";
import type { MeetingFilters } from "@costlens/shared";

const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Finance",
  "Operations",
  "HR",
  "Data Science",
];

export default function Meetings() {
  const [filters, setFilters] = useState<MeetingFilters>({
    page: 1,
    pageSize: 20,
  });
  const [searchInput, setSearchInput] = useState("");

  const { data: apiResponse, isLoading } = useMeetings(filters);
  const meetings = apiResponse?.data ?? mockMeetings;
  const total = apiResponse?.total ?? mockMeetings.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, search: searchInput, page: 1 }));
  };

  const handleFilterChange = (key: keyof MeetingFilters, value: string) => {
    setFilters((f) => ({
      ...f,
      [key]: value || undefined,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setSearchInput("");
    setFilters({ page: 1, pageSize: 20 });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search meetings by title or description..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={String(filters.projectId ?? "")}
              onChange={(e) => handleFilterChange("projectId", e.target.value)}
              className="w-full sm:w-48"
            >
              <option value="">All Projects</option>
              {mockProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
            <Select
              value={filters.department ?? ""}
              onChange={(e) => handleFilterChange("department", e.target.value)}
              className="w-full sm:w-44"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
            <Button type="submit" variant="default" size="default">
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={clearFilters}
            >
              Clear
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Meetings
              <span className="ml-2 text-sm font-normal text-slate-400">
                ({total} total)
              </span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-500">Loading meetings...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/60">
                  <TableHead className="pl-6">Meeting</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead className="pr-6">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meetings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-slate-400"
                    >
                      No meetings found
                    </TableCell>
                  </TableRow>
                ) : (
                  meetings.map((meeting) => (
                    <TableRow key={meeting.id}>
                      <TableCell className="pl-6">
                        <p className="font-medium text-slate-800 max-w-xs">
                          {truncate(meeting.title, 50)}
                        </p>
                        {meeting.description && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {truncate(meeting.description, 60)}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={meeting.projectId ? "secondary" : "outline"}
                        >
                          {meeting.projectName ?? "Unattributed"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {formatDuration(meeting.durationMinutes)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-600">
                            {meeting.participants?.length ?? 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-slate-800">
                          {formatCurrency(meeting.cost ?? 0)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${getConfidenceBg(meeting.confidenceScore)} ${getConfidenceColor(meeting.confidenceScore)}`}
                        >
                          {meeting.confidenceScore.toFixed(0)}%
                        </span>
                      </TableCell>
                      <TableCell className="pr-6 text-slate-500 text-sm">
                        {formatDate(meeting.meetingDate)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > (filters.pageSize ?? 20) && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page === 1}
            onClick={() =>
              setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))
            }
          >
            Previous
          </Button>
          <span className="text-sm text-slate-500 self-center">
            Page {filters.page ?? 1} of{" "}
            {Math.ceil(total / (filters.pageSize ?? 20))}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={
              (filters.page ?? 1) >= Math.ceil(total / (filters.pageSize ?? 20))
            }
            onClick={() =>
              setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))
            }
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
