"use client";

import type { JobSubmissionItem } from "@cpa/shared";
import {
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { fetchAdminJobSubmissions, reviewAdminJobSubmission } from "@/lib/api";
import {
  deadlineTypeLabels,
  employmentLabels,
  jobFamilyLabels,
  kicpaLabels,
  traineeLabels,
} from "@/lib/labels";

export default function AdminPage() {
  const [jobs, setJobs] = useState<JobSubmissionItem[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load(options: { quiet?: boolean } = {}) {
    if (!options.quiet) {
      setLoading(true);
      setMessage("");
    }
    try {
      const data = await fetchAdminJobSubmissions();
      setJobs(data.items);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "검수 목록을 불러오지 못했습니다.",
      );
    } finally {
      if (!options.quiet) setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    fetchAdminJobSubmissions()
      .then((data) => {
        if (!ignore) setJobs(data.items);
      })
      .catch((error) => {
        if (!ignore) {
          setMessage(
            error instanceof Error
              ? error.message
              : "검수 목록을 불러오지 못했습니다.",
          );
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function reviewJob(id: string, action: "approve" | "reject") {
    setMessage("");
    try {
      await reviewAdminJobSubmission(id, action, notes[id]);
      setMessage(
        action === "approve" ? "공고를 승인했습니다." : "공고를 반려했습니다.",
      );
      await load({ quiet: true });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "처리하지 못했습니다.",
      );
    }
  }

  const pendingJobs = jobs.filter((item) => item.status === "PENDING");
  const createPending = pendingJobs.filter(
    (item) => item.submissionType === "CREATE",
  ).length;
  const updatePending = pendingJobs.filter(
    (item) => item.submissionType === "UPDATE",
  ).length;

  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-[var(--background)] px-5 py-8">
        <div className="mx-auto grid max-w-7xl gap-6">
          <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--app-line)] pb-5">
            <div>
              <p className="text-sm font-semibold text-[var(--proto-brand)]">
                Admin
              </p>
              <h1 className="mt-1 flex items-center gap-2 text-3xl font-black tracking-tight text-gray-950">
                <ShieldCheck size={28} />
                공고 검수 대시보드
              </h1>
            </div>
            <div className="grid grid-cols-3 gap-3 text-right">
              <Metric label="공고 대기" value={pendingJobs.length} />
              <Metric label="신규 게시" value={createPending} />
              <Metric label="수정 요청" value={updatePending} />
            </div>
          </header>

          {message && (
            <div className="border border-[var(--app-line)] bg-white px-4 py-3 text-sm">
              {message}
            </div>
          )}

          {loading ? (
            <div className="border border-[var(--app-line)] bg-white p-5 text-sm text-[var(--app-muted)]">
              공고 검수 목록을 불러오는 중입니다.
            </div>
          ) : (
            <section className="grid gap-4">
              {jobs.length ? (
                jobs.map((submission) => (
                  <JobReviewCard
                    key={submission.id}
                    note={notes[submission.id] ?? ""}
                    submission={submission}
                    onNote={(value) =>
                      setNotes((current) => ({
                        ...current,
                        [submission.id]: value,
                      }))
                    }
                    onApprove={() => void reviewJob(submission.id, "approve")}
                    onReject={() => void reviewJob(submission.id, "reject")}
                  />
                ))
              ) : (
                <EmptyState label="공고 제출이 없습니다." />
              )}
            </section>
          )}
        </div>
      </main>
    </>
  );
}

function JobReviewCard({
  submission,
  note,
  onNote,
  onApprove,
  onReject,
}: {
  submission: JobSubmissionItem;
  note: string;
  onNote: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const isPending = submission.status === "PENDING";
  const isUpdate = submission.submissionType === "UPDATE";

  return (
    <article className="border border-[var(--app-line)] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={isUpdate ? "brand" : "neutral"}>
              {isUpdate ? "수정 요청" : "신규 게시"}
            </Badge>
            <Badge tone={statusTone(submission.status)}>
              {statusLabel(submission.status)}
            </Badge>
          </div>
          <h2 className="mt-2 text-xl font-black text-gray-950">
            {submission.title}
          </h2>
          <p className="mt-2 text-sm text-[var(--app-muted)]">
            {submission.companyName} · 제출자 {submission.submittedByUsername} ·{" "}
            {new Date(submission.createdAt).toLocaleString("ko-KR")}
          </p>
          {isUpdate && (
            <p className="mt-1 text-sm font-semibold text-[var(--proto-brand)]">
              수정 대상: {submission.targetJobTitle ?? submission.targetJobId}
            </p>
          )}
        </div>
        {submission.originalUrl ? (
          <a
            className="rounded-lg border border-[var(--app-line)] px-3 py-2 text-sm font-semibold"
            href={submission.originalUrl}
            rel="noreferrer"
            target="_blank"
          >
            원문
          </a>
        ) : (
          <span className="rounded-lg border border-[var(--app-line)] px-3 py-2 text-sm font-semibold text-[var(--app-muted)]">
            원문 없음
          </span>
        )}
      </div>
      <div className="mt-4 grid gap-2 text-sm md:grid-cols-3 xl:grid-cols-6">
        <Info label="직무군" value={jobFamilyLabels[submission.jobFamily]} />
        <Info
          label="고용형태"
          value={employmentLabels[submission.employmentType]}
        />
        <Info label="KICPA" value={kicpaLabels[submission.kicpaCondition]} />
        <Info label="수습" value={traineeLabels[submission.traineeStatus]} />
        <Info label="지역" value={submission.location ?? "불명확"} />
        <Info
          label="마감"
          value={
            submission.deadline
              ? new Date(submission.deadline).toLocaleDateString("ko-KR")
              : deadlineTypeLabels[submission.deadlineType]
          }
        />
      </div>
      <p className="mt-4 whitespace-pre-wrap border-l-2 border-[var(--proto-brand-mid)] pl-3 text-sm leading-6 text-gray-700">
        {submission.description}
      </p>
      <ReviewActions
        disabled={!isPending}
        note={note}
        onApprove={onApprove}
        onNote={onNote}
        onReject={onReject}
      />
    </article>
  );
}

function ReviewActions({
  disabled,
  note,
  onNote,
  onApprove,
  onReject,
}: {
  disabled: boolean;
  note: string;
  onNote: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
      <textarea
        className="form-input min-h-20"
        disabled={disabled}
        placeholder="관리자 메모"
        value={note}
        onChange={(event) => onNote(event.target.value)}
      />
      <div className="flex items-start gap-2">
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          disabled={disabled}
          type="button"
          onClick={onApprove}
        >
          <CheckCircle2 size={16} />
          승인
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          disabled={disabled}
          type="button"
          onClick={onReject}
        >
          <XCircle size={16} />
          반려
        </button>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[var(--app-line)] bg-[#fbfbf8] px-3 py-2">
      <p className="text-xs font-semibold text-[var(--app-muted)]">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-gray-950">
        {value}
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-[var(--app-line)] bg-white px-4 py-3">
      <p className="text-xs font-semibold text-[var(--app-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-black text-gray-950">{value}</p>
    </div>
  );
}

function Badge({
  tone,
  children,
}: {
  tone: "brand" | "neutral" | "muted";
  children: ReactNode;
}) {
  const styles = {
    brand: {
      background: "var(--proto-brand-light)",
      borderColor: "var(--proto-brand-mid)",
      color: "var(--proto-brand)",
    },
    neutral: {
      background: "#fbfbf8",
      borderColor: "var(--app-line)",
      color: "#111827",
    },
    muted: {
      background: "transparent",
      borderColor: "var(--app-line)",
      color: "var(--app-muted)",
    },
  }[tone];

  return (
    <span
      className="rounded-full border px-2.5 py-1 text-xs font-black"
      style={styles}
    >
      {children}
    </span>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="border border-[var(--app-line)] bg-white p-5 text-sm text-[var(--app-muted)]">
      <ClipboardList className="mb-2" size={18} />
      {label}
    </div>
  );
}

function statusTone(status: string) {
  if (status === "PENDING") return "brand";
  return "muted";
}

function statusLabel(status: string) {
  if (status === "APPROVED") return "승인";
  if (status === "REJECTED") return "반려";
  return "검수 대기";
}
