import {
  jobStatusLabels,
  userRoleLabels,
  type JobStatus,
} from "@/components/admin/admin-demo-data";

const jobStatusClasses: Record<JobStatus, string> = {
  OPEN: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CLOSED: "border-gray-200 bg-gray-50 text-gray-600",
  DRAFT: "border-amber-200 bg-amber-50 text-amber-700",
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${jobStatusClasses[status]}`}
    >
      {jobStatusLabels[status]}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2 py-0.5 text-xs font-semibold text-gray-700">
      {userRoleLabels[role] ?? role}
    </span>
  );
}
