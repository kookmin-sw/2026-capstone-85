"use client";

import type {
  BookmarkItem,
  BookmarkTargetType,
  CommunityBoardType,
  MyCommunityActivityItem,
  MyProfileResponse,
  PersonalCareerStage,
  ResumeItem,
} from "@cpa/shared";
import {
  Award,
  Bookmark,
  Camera,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Download,
  EyeOff,
  FileText,
  KeyRound,
  MessageCircle,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SiteNav } from "@/components/site-nav";
import { ActionButton, ActionLink } from "@/components/ui/action-button";
import {
  deleteMyBookmark,
  deleteMyResume,
  fetchCurrentUser,
  fetchMyBookmarks,
  fetchMyCommunityActivity,
  fetchMyProfile,
  fetchMyResumes,
  getMyResumeDownloadUrl,
  updateMyProfile,
  uploadMyResume,
} from "@/lib/api";
import {
  communityDetailHref,
  companyDetailHref,
  jobDetailHref,
} from "@/lib/routes";
import styles from "./mypage.module.css";

const RESUME_MAX_BYTES = 10 * 1024 * 1024;
const RESUME_EXTENSIONS = new Set(["pdf", "doc", "docx", "hwp", "hwpx"]);
const PROFILE_IMAGE_MAX_BYTES = 1.5 * 1024 * 1024;
const PROFILE_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);
const PROFILE_COMPLETION_COLLAPSED_STORAGE_KEY =
  "accountit:mypage-profile-completion:collapsed";
const PROFILE_COMPLETION_HIDDEN_UNTIL_STORAGE_KEY =
  "accountit:mypage-profile-completion:hiddenUntil";
const PROFILE_COMPLETION_SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;

type ProfileCompletionAction =
  | "profileImage"
  | "displayName"
  | "resume"
  | "cpa"
  | "jobs"
  | "community";

type ProfileCompletionStep = {
  id: string;
  label: string;
  description: string;
  points: number;
  earned: number;
  completed: boolean;
  action: ProfileCompletionAction;
  actionLabel: string;
  href?: string;
};

type ProfileCompletion = {
  score: number;
  level: string;
  reason: string;
  nextStep: ProfileCompletionStep | null;
  steps: ProfileCompletionStep[];
};

const careerStageLabels: Record<PersonalCareerStage, string> = {
  CPA_UNPLACED: "CPA 취득, 수습처 미확정",
  TRAINEE: "수습 CPA",
  LICENSED_CPA: "일반 회계사",
};

const verificationLabels: Record<string, string> = {
  UNVERIFIED: "미검증",
  PENDING: "검토 중",
  CPA_VERIFIED: "검증 완료",
  REJECTED: "반려",
};

const employmentLabels: Record<string, string> = {
  UNKNOWN: "확인 전",
  NONE: "고용 이력 없음",
  HAS_EMPLOYMENT: "고용 이력 있음",
};

const boardLabels: Record<CommunityBoardType, string> = {
  CPA_PREP: "질문게시판",
  TRAINEE: "수습 CPA방",
  SENIOR: "선배 CPA Q&A",
  FREE: "비밀게시판",
};

export default function MyPage() {
  const [profile, setProfile] = useState<MyProfileResponse | null>(null);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [communityActivity, setCommunityActivity] = useState<
    MyCommunityActivityItem[]
  >([]);
  const [communityActivityTotal, setCommunityActivityTotal] = useState(0);
  const [bookmarkFilter, setBookmarkFilter] = useState<
    BookmarkTargetType | "ALL"
  >("ALL");
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);
  const [updatingProfileImage, setUpdatingProfileImage] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState("");
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [profileCompletionCollapsed, setProfileCompletionCollapsed] =
    useState(false);
  const [profileCompletionHidden, setProfileCompletionHidden] = useState(false);

  const resumeFileInputRef = useRef<HTMLInputElement>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const displayNameInputRef = useRef<HTMLInputElement>(null);
  const verificationBadgeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoadError("");
      try {
        const user = await fetchCurrentUser();
        if (!user || user.role !== "JOB_SEEKER") {
          if (!ignore) {
            setAuthorized(false);
            setLoading(false);
          }
          return;
        }

        if (!ignore) setAuthorized(true);

        const [profileResult, bookmarkResult, resumeResult, activityResult] =
          await Promise.allSettled([
            fetchMyProfile(),
            fetchMyBookmarks(),
            fetchMyResumes(),
            fetchMyCommunityActivity(5),
          ]);

        if (ignore) return;

        if (profileResult.status === "fulfilled") {
          setProfile(profileResult.value);
          setDisplayNameInput(profileResult.value.displayName ?? "");
        } else {
          setProfile(null);
          setLoadError(
            profileResult.reason instanceof Error
              ? profileResult.reason.message
              : "프로필 정보를 불러오지 못했습니다.",
          );
        }

        setBookmarks(
          bookmarkResult.status === "fulfilled"
            ? bookmarkResult.value.items
            : [],
        );
        setResumes(
          resumeResult.status === "fulfilled" ? resumeResult.value.items : [],
        );
        setCommunityActivity(
          activityResult.status === "fulfilled"
            ? activityResult.value.items
            : [],
        );
        setCommunityActivityTotal(
          activityResult.status === "fulfilled" ? activityResult.value.total : 0,
        );

        const sideLoadErrors = [
          bookmarkResult.status === "rejected" ? "북마크" : "",
          resumeResult.status === "rejected" ? "이력서" : "",
          activityResult.status === "rejected" ? "커뮤니티 활동" : "",
        ].filter(Boolean);

        if (profileResult.status === "fulfilled" && sideLoadErrors.length > 0) {
          setMessage(
            `${sideLoadErrors.join(", ")} 정보를 일부 불러오지 못했습니다.`,
          );
        }
      } catch (error) {
        if (!ignore) {
          setAuthorized(false);
          setLoadError(
            error instanceof Error
              ? error.message
              : "현재 사용자를 확인하지 못했습니다.",
          );
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void load();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const button = verificationBadgeButtonRef.current;
    if (!button || !profile) return;

    const open = () => setVerificationModalOpen(true);
    button.addEventListener("mousedown", open);
    button.addEventListener("click", open);
    return () => {
      button.removeEventListener("mousedown", open);
      button.removeEventListener("click", open);
    };
  }, [profile]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setProfileCompletionCollapsed(
          window.localStorage.getItem(
            PROFILE_COMPLETION_COLLAPSED_STORAGE_KEY,
          ) === "true",
        );

        const hiddenUntil = Number(
          window.localStorage.getItem(
            PROFILE_COMPLETION_HIDDEN_UNTIL_STORAGE_KEY,
          ),
        );
        const shouldHide =
          Number.isFinite(hiddenUntil) && hiddenUntil > Date.now();
        setProfileCompletionHidden(shouldHide);
        if (!shouldHide) {
          window.localStorage.removeItem(
            PROFILE_COMPLETION_HIDDEN_UNTIL_STORAGE_KEY,
          );
        }
      } catch {
        // Browser storage can be unavailable in restricted/private contexts.
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredBookmarks =
    bookmarkFilter === "ALL"
      ? bookmarks
      : bookmarks.filter((bm) => bm.targetType === bookmarkFilter);

  const profileCompletion = useMemo(() => {
    if (!profile) return null;
    return calculateProfileCompletion(
      profile,
      resumes.length,
      bookmarks.length,
      communityActivityTotal,
    );
  }, [profile, resumes.length, bookmarks.length, communityActivityTotal]);

  async function handleProfileSave(event: FormEvent) {
    event.preventDefault();
    if (!profile) return;
    setMessage("");
    try {
      const updated = await updateMyProfile({
        displayName: displayNameInput,
      });
      setProfile(updated);
      setDisplayNameInput(updated.displayName ?? "");
      setMessage("프로필을 수정했습니다.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "프로필 수정에 실패했습니다.",
      );
    }
  }

  async function handleProfileImageUpload(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setMessage("");

    const validationMessage = validateProfileImage(file);
    if (validationMessage) {
      setMessage(validationMessage);
      if (profileImageInputRef.current) profileImageInputRef.current.value = "";
      return;
    }

    setUpdatingProfileImage(true);
    try {
      const profileImageUrl = await readFileAsDataUrl(file);
      const updated = await updateMyProfile({ profileImageUrl });
      setProfile(updated);
      setMessage("프로필 사진을 변경했습니다.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "프로필 사진 변경에 실패했습니다.",
      );
    } finally {
      setUpdatingProfileImage(false);
      if (profileImageInputRef.current) profileImageInputRef.current.value = "";
    }
  }

  async function handleDeleteBookmark(id: string) {
    setMessage("");
    try {
      await deleteMyBookmark(id);
      setBookmarks((prev) => prev.filter((bm) => bm.id !== id));
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "북마크 삭제에 실패했습니다.",
      );
    }
  }

  async function handleUploadResume(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setMessage("");

    const validationMessage = validateResumeFile(file);
    if (validationMessage) {
      setMessage(validationMessage);
      if (resumeFileInputRef.current) resumeFileInputRef.current.value = "";
      return;
    }

    setUploadingResume(true);
    try {
      const resume = await uploadMyResume(file);
      setResumes((prev) => [resume, ...prev]);
      setMessage("이력서를 업로드했습니다.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "이력서 업로드에 실패했습니다.",
      );
    } finally {
      setUploadingResume(false);
      if (resumeFileInputRef.current) resumeFileInputRef.current.value = "";
    }
  }

  async function handleDeleteResume(id: string) {
    if (!window.confirm("이력서를 삭제할까요?")) return;
    setMessage("");
    try {
      await deleteMyResume(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "이력서 삭제에 실패했습니다.",
      );
    }
  }

  function handleProfileCompletionAction(action: ProfileCompletionAction) {
    if (action === "profileImage") {
      profileImageInputRef.current?.click();
      return;
    }
    if (action === "displayName") {
      displayNameInputRef.current?.focus();
      displayNameInputRef.current?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
      return;
    }
    if (action === "resume") {
      if (uploadingResume) return;
      if (resumes.length >= 5) {
        setMessage("이력서는 최대 5개까지 업로드할 수 있습니다.");
        return;
      }
      resumeFileInputRef.current?.click();
      return;
    }
    if (action === "cpa") {
      setVerificationModalOpen(true);
    }
  }

  function toggleProfileCompletionCollapsed() {
    setProfileCompletionCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(
          PROFILE_COMPLETION_COLLAPSED_STORAGE_KEY,
          String(next),
        );
      } catch {
        // Ignore storage failures; the in-memory state still updates.
      }
      return next;
    });
  }

  function hideProfileCompletionForWeek() {
    const hiddenUntil = Date.now() + PROFILE_COMPLETION_SNOOZE_MS;
    setProfileCompletionHidden(true);
    try {
      window.localStorage.setItem(
        PROFILE_COMPLETION_HIDDEN_UNTIL_STORAGE_KEY,
        String(hiddenUntil),
      );
    } catch {
      // Ignore storage failures; the in-memory state still hides the card.
    }
  }

  function restoreProfileCompletionCard() {
    setProfileCompletionHidden(false);
    setProfileCompletionCollapsed(false);
    try {
      window.localStorage.removeItem(
        PROFILE_COMPLETION_HIDDEN_UNTIL_STORAGE_KEY,
      );
      window.localStorage.setItem(
        PROFILE_COMPLETION_COLLAPSED_STORAGE_KEY,
        "false",
      );
    } catch {
      // Ignore storage failures; the in-memory state still restores the card.
    }
  }

  if (loading) {
    return (
      <>
        <SiteNav />
        <main className={styles.page}>
          <div className={styles.container}>
            <p className={styles.loadingText}>
              마이페이지를 불러오는 중입니다.
            </p>
          </div>
        </main>
      </>
    );
  }

  if (!authorized) {
    return (
      <>
        <SiteNav />
        <main className={styles.page}>
          <div className={styles.authCard}>
            <h1 className={styles.authTitle}>마이페이지</h1>
            <p className={styles.authError}>개인회원 로그인이 필요합니다.</p>
            <ActionLink
              href="/login?next=/mypage"
              className={styles.authAction}
            >
              로그인
            </ActionLink>
          </div>
        </main>
      </>
    );
  }

  if (!profile || !profileCompletion) {
    return (
      <>
        <SiteNav />
        <main className={styles.page}>
          <div className={styles.authCard}>
            <h1 className={styles.authTitle}>마이페이지</h1>
            <p className={styles.authError}>
              로그인은 확인됐지만 마이페이지 정보를 불러오지 못했습니다.
            </p>
            {loadError && <p className={styles.loadErrorDetail}>{loadError}</p>}
            <div className={styles.authActions}>
              <ActionButton
                type="button"
                onClick={() => window.location.reload()}
              >
                다시 시도
              </ActionButton>
              <ActionLink href="/jobs" variant="subtle">
                채용공고로 이동
              </ActionLink>
            </div>
          </div>
        </main>
      </>
    );
  }

  const displayName = profile.displayName ?? profile.username;
  const displayNameDirty =
    displayNameInput.trim() !== (profile.displayName ?? "");
  const profileComplete = profileCompletion.score === 100;

  function openVerificationModal() {
    setVerificationModalOpen(true);
  }

  return (
    <>
      <SiteNav />
      <main className={styles.page}>
        <div className={styles.container}>
          <section
            className={`${styles.hero} ${
              profileComplete ? styles.heroComplete : ""
            }`}
          >
            <div className={styles.coverImage} aria-hidden="true" />
            <div className={styles.heroBody}>
              <div className={styles.heroProfile}>
                <button
                  type="button"
                  className={`${styles.avatarButton} ${
                    profileComplete ? styles.avatarButtonComplete : ""
                  }`}
                  onClick={() => profileImageInputRef.current?.click()}
                  disabled={updatingProfileImage}
                  aria-label="프로필 사진 업로드"
                >
                  {profile.profileImageUrl ? (
                    <Image
                      src={profile.profileImageUrl}
                      alt={`${displayName} 프로필 사진`}
                      className={styles.avatarImage}
                      fill
                      sizes="104px"
                      unoptimized
                    />
                  ) : (
                    <span className={styles.avatarInitial}>
                      {displayName.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className={styles.avatarCamera}>
                    <Camera size={15} />
                  </span>
                </button>
                <input
                  ref={profileImageInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className={styles.hiddenInput}
                  onChange={handleProfileImageUpload}
                />
                <div className={styles.heroInfo}>
                  <h1>{displayName}</h1>
                  <p>
                    @{profile.username} · 가입일 {formatDate(profile.createdAt)}
                  </p>
                </div>
              </div>
              <div className={styles.heroBadgeArea}>
                <button
                  ref={verificationBadgeButtonRef}
                  type="button"
                  className={styles.badgeButton}
                  onMouseDown={openVerificationModal}
                  onClick={openVerificationModal}
                  aria-label="CPA 인증 상세 보기"
                >
                  <VerificationBadge status={profile.cpaVerificationStatus} />
                </button>
                {profileComplete && (
                  <span className={styles.profileCompleteBadge}>
                    <Award size={14} />
                    프로필 완성
                  </span>
                )}
              </div>
            </div>
          </section>

          {message && <div className={styles.message}>{message}</div>}

          <div
            className={`${styles.summaryGrid} ${
              profileCompletionHidden ? styles.summaryGridCompact : ""
            }`}
          >
            {!profileCompletionHidden && (
              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h2>
                    <Sparkles size={17} />
                    프로필 꾸미기 점수
                  </h2>
                  <div className={styles.completionPanelActions}>
                    <span className={styles.completionHeaderScore}>
                      {profileCompletion.score}%
                    </span>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={toggleProfileCompletionCollapsed}
                      aria-label={
                        profileCompletionCollapsed
                          ? "프로필 꾸미기 점수 펼치기"
                          : "프로필 꾸미기 점수 접기"
                      }
                    >
                      {profileCompletionCollapsed ? (
                        <ChevronDown size={15} />
                      ) : (
                        <ChevronUp size={15} />
                      )}
                    </button>
                    <button
                      type="button"
                      className={styles.snoozeButton}
                      onClick={hideProfileCompletionForWeek}
                    >
                      <EyeOff size={14} />
                      일주일간 보지 않기
                    </button>
                  </div>
                </div>

                {!profileCompletionCollapsed && (
                  <>
                    <div className={styles.completionScoreRow}>
                      <div
                        className={`${styles.scoreCircle} ${
                          profileComplete ? styles.scoreCircleComplete : ""
                        }`}
                      >
                        <strong>{profileCompletion.score}</strong>
                        <span>%</span>
                      </div>
                      <div className={styles.completionCopy}>
                        <p>{profileCompletion.level}</p>
                        <span>{profileCompletion.reason}</span>
                      </div>
                    </div>
                    <div
                      className={styles.scoreTrack}
                      aria-label={`프로필 꾸미기 점수 ${profileCompletion.score}%`}
                    >
                      <span style={{ width: `${profileCompletion.score}%` }} />
                    </div>

                    {profileCompletion.nextStep && (
                      <div className={styles.nextActionBox}>
                        <span>다음 추천</span>
                        <strong>{profileCompletion.nextStep.label}</strong>
                        <p>{profileCompletion.nextStep.description}</p>
                        <CompletionAction
                          step={profileCompletion.nextStep}
                          className={styles.nextActionButton}
                          onAction={handleProfileCompletionAction}
                        />
                      </div>
                    )}

                    <div className={styles.completionChecklist}>
                      {profileCompletion.steps.map((step) => (
                        <div
                          key={step.id}
                          className={`${styles.completionStep} ${
                            step.completed ? styles.completionStepDone : ""
                          }`}
                        >
                          <span
                            className={styles.stepCheck}
                            aria-hidden="true"
                          >
                            <CheckCircle2 size={14} />
                          </span>
                          <div className={styles.stepCopy}>
                            <strong>{step.label}</strong>
                            <span>{step.description}</span>
                          </div>
                          <span className={styles.stepPoints}>
                            {step.earned}/{step.points}
                          </span>
                          <CompletionAction
                            step={step}
                            className={styles.stepAction}
                            onAction={handleProfileCompletionAction}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </section>
            )}

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>
                  <CheckCircle2 size={17} />내 상태
                </h2>
              </div>
              <div className={styles.statGrid}>
                <StatItem label="이력서" value={`${resumes.length}/5`} />
                <StatItem label="북마크" value={`${bookmarks.length}개`} />
                <StatItem
                  label="CPA"
                  value={verificationLabels[profile.cpaVerificationStatus]}
                />
                <StatItem
                  label="활동"
                  value={`${communityActivityTotal}개`}
                />
              </div>
              {profileCompletionHidden && (
                <div className={styles.restoreProfileScoreAction}>
                  <ActionButton
                    type="button"
                    size="sm"
                    variant="outline"
                    iconStart={<RotateCcw size={14} />}
                    onClick={restoreProfileCompletionCard}
                  >
                    프로필 점수 다시 보기
                  </ActionButton>
                </div>
              )}
            </section>
          </div>

          <div className={styles.mainGrid}>
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>내 프로필</h2>
              </div>
              <form className={styles.profileForm} onSubmit={handleProfileSave}>
                <label className={styles.field}>
                  표시이름
                  <input
                    ref={displayNameInputRef}
                    className={styles.input}
                    value={displayNameInput}
                    onChange={(e) => setDisplayNameInput(e.target.value)}
                    placeholder="닉네임"
                    maxLength={50}
                  />
                </label>
                <div className={styles.field}>
                  아이디
                  <div className={styles.fieldValue}>{profile.username}</div>
                </div>
                <div className={styles.formActions}>
                  <ActionButton
                    type="submit"
                    size="sm"
                    disabled={!displayNameDirty}
                  >
                    프로필 저장
                  </ActionButton>
                </div>
              </form>

              <div className={styles.passwordForm}>
                <div className={styles.subsectionTitle}>
                  <KeyRound size={16} />
                  비밀번호
                </div>
                <label className={styles.field}>
                  현재 비밀번호
                  <input
                    className={styles.input}
                    type="password"
                    autoComplete="current-password"
                    disabled
                  />
                </label>
                <label className={styles.field}>
                  새 비밀번호
                  <input
                    className={styles.input}
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    disabled
                  />
                </label>
                <label className={styles.field}>
                  새 비밀번호 확인
                  <input
                    className={styles.input}
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    disabled
                  />
                </label>
                <div className={styles.formActions}>
                  <ActionButton
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled
                  >
                    비밀번호 변경
                  </ActionButton>
                </div>
              </div>
            </section>
          </div>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>
                <FileText size={17} />
                이력서
              </h2>
              <ActionButton
                type="button"
                size="sm"
                variant="outline"
                iconStart={<Upload size={14} />}
                onClick={() => {
                  if (uploadingResume) return;
                  if (resumes.length >= 5) {
                    setMessage("이력서는 최대 5개까지 업로드할 수 있습니다.");
                    return;
                  }
                  resumeFileInputRef.current?.click();
                }}
                disabled={uploadingResume}
              >
                {uploadingResume ? "업로드 중" : "파일 선택"}
              </ActionButton>
            </div>
            <input
              ref={resumeFileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.hwp,.hwpx"
              className={styles.hiddenInput}
              onChange={handleUploadResume}
            />
            {resumes.length ? (
              <div className={styles.resumeList}>
                {resumes.map((resume) => (
                  <div key={resume.id} className={styles.resumeItem}>
                    <div className={styles.resumeInfo}>
                      <FileText size={18} className={styles.resumeIcon} />
                      <div>
                        <div className={styles.resumeName}>
                          {resume.fileName}
                        </div>
                        <div className={styles.resumeMeta}>
                          {formatFileSize(resume.byteSize)} ·{" "}
                          {formatDate(resume.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className={styles.itemActions}>
                      <a
                        href={getMyResumeDownloadUrl(resume.id)}
                        className={styles.iconButton}
                        aria-label="이력서 다운로드"
                      >
                        <Download size={15} />
                      </a>
                      <button
                        type="button"
                        className={styles.iconButtonDanger}
                        onClick={() => void handleDeleteResume(resume.id)}
                        aria-label="이력서 삭제"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>업로드한 이력서가 없습니다.</div>
            )}
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>
                <Bookmark size={17} />
                북마크
              </h2>
              <div className={styles.filterRow}>
                <FilterButton
                  active={bookmarkFilter === "ALL"}
                  onClick={() => setBookmarkFilter("ALL")}
                >
                  전체
                </FilterButton>
                <FilterButton
                  active={bookmarkFilter === "JOB"}
                  onClick={() => setBookmarkFilter("JOB")}
                >
                  공고
                </FilterButton>
                <FilterButton
                  active={bookmarkFilter === "COMPANY"}
                  onClick={() => setBookmarkFilter("COMPANY")}
                >
                  회사
                </FilterButton>
              </div>
            </div>
            {filteredBookmarks.length ? (
              <div className={styles.bookmarkList}>
                {filteredBookmarks.map((bm) => (
                  <div key={bm.id} className={styles.bookmarkItem}>
                    <Link
                      href={
                        bm.targetType === "JOB"
                          ? jobDetailHref(bm.targetId)
                          : companyDetailHref(bm.targetId)
                      }
                      className={styles.bookmarkInfo}
                    >
                      <div className={styles.bookmarkTitle}>
                        {bm.targetTitle}
                      </div>
                      <div className={styles.bookmarkSub}>
                        {bm.targetSubtitle} · {formatDate(bm.createdAt)}
                      </div>
                    </Link>
                    <span className={styles.bookmarkType}>
                      {bm.targetType === "JOB" ? "공고" : "회사"}
                    </span>
                    <button
                      type="button"
                      className={styles.iconButtonDanger}
                      onClick={() => void handleDeleteBookmark(bm.id)}
                      aria-label="북마크 삭제"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>북마크한 항목이 없습니다.</div>
            )}
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>
                <MessageCircle size={17} />내 커뮤니티 활동
              </h2>
              {communityActivityTotal > 5 && (
                <Link href="/mypage/activities" className={styles.textButton}>
                  전체 보기
                </Link>
              )}
            </div>
            {communityActivity.length ? (
              <div className={styles.activityList}>
                {communityActivity.map((activity) => (
                  <Link
                    key={activity.id}
                    href={communityDetailHref(activity.id)}
                    className={styles.activityItem}
                  >
                    <div className={styles.activityTitle}>
                      <span>{boardLabels[activity.boardType]}</span>
                      <span>{activity.title}</span>
                    </div>
                    <div className={styles.activityMeta}>
                      댓글 {activity.commentCount} · 좋아요 {activity.likeCount}{" "}
                      · {formatDate(activity.createdAt)}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>아직 작성한 글이 없습니다.</div>
            )}
          </section>
        </div>
      </main>

      {verificationModalOpen && (
        <div
          className={styles.modalOverlay}
          role="presentation"
          onMouseDown={() => setVerificationModalOpen(false)}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="verification-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setVerificationModalOpen(false)}
              aria-label="닫기"
            >
              <X size={18} />
            </button>
            <div className={styles.modalBadge}>
              <VerificationBadge
                status={profile.cpaVerificationStatus}
                size="large"
              />
            </div>
            <h2 id="verification-modal-title" className={styles.modalTitle}>
              CPA 검증 상태
            </h2>
            <div className={styles.statusRows}>
              <InfoRow
                label="현재 상태"
                value={verificationLabels[profile.cpaVerificationStatus]}
              />
              <InfoRow
                label="인증 일자"
                value={
                  profile.verifiedAt ? formatDate(profile.verifiedAt) : "-"
                }
              />
              <InfoRow
                label="수습 상태"
                value={
                  profile.careerStage
                    ? careerStageLabels[profile.careerStage]
                    : "미설정"
                }
              />
              <InfoRow
                label="고용 이력"
                value={employmentLabels[profile.employmentHistoryStatus]}
              />
              <InfoRow
                label="커뮤니티 뱃지"
                value={
                  profile.cpaVerificationStatus === "CPA_VERIFIED"
                    ? "활성"
                    : "비활성"
                }
              />
              <InfoRow
                label="수습 CPA 방"
                value={
                  profile.traineeRoomAccess ? "입장 가능" : "검증 후 입장 가능"
                }
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function VerificationBadge({
  status,
  size = "normal",
}: {
  status: MyProfileResponse["cpaVerificationStatus"];
  size?: "normal" | "large";
}) {
  const toneClass =
    status === "CPA_VERIFIED"
      ? styles.badgeVerified
      : status === "PENDING"
        ? styles.badgePending
        : status === "REJECTED"
          ? styles.badgeRejected
          : styles.badgeUnverified;

  return (
    <span
      className={`${styles.cpaBadge} ${toneClass} ${
        size === "large" ? styles.cpaBadgeLarge : ""
      }`}
    >
      <span className={styles.badgeSeal} aria-hidden="true" />
      <span className={styles.badgeLabel}>{verificationLabels[status]}</span>
    </span>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.statItem}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.infoRow}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`${styles.filterBtn} ${active ? styles.filterBtnActive : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function CompletionAction({
  step,
  className,
  onAction,
}: {
  step: ProfileCompletionStep;
  className: string;
  onAction: (action: ProfileCompletionAction) => void;
}) {
  if (step.href) {
    return (
      <Link href={step.href} className={className}>
        {step.actionLabel}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => onAction(step.action)}
    >
      {step.actionLabel}
    </button>
  );
}

function calculateProfileCompletion(
  profile: MyProfileResponse,
  resumeCount: number,
  bookmarkCount: number,
  communityActivityTotal: number,
): ProfileCompletion {
  const bookmarkEarned = Math.min(bookmarkCount * 5, 15);
  const communityEarned = Math.min(communityActivityTotal * 5, 15);
  const cpaEarned =
    profile.cpaVerificationStatus === "CPA_VERIFIED"
      ? 20
      : profile.cpaVerificationStatus === "PENDING"
        ? 10
        : 0;
  const steps: ProfileCompletionStep[] = [
    {
      id: "profile-image",
      label: "프로필 사진 추가",
      description: profile.profileImageUrl
        ? "사진이 있어 프로필 첫인상이 또렷합니다."
        : "사진을 넣으면 마이페이지가 더 개인화되어 보입니다.",
      points: 20,
      earned: profile.profileImageUrl ? 20 : 0,
      completed: Boolean(profile.profileImageUrl),
      action: "profileImage",
      actionLabel: profile.profileImageUrl ? "변경" : "추가",
    },
    {
      id: "display-name",
      label: "표시이름 설정",
      description: profile.displayName
        ? "닉네임이 설정되어 활동 내역을 알아보기 쉽습니다."
        : "표시이름을 정하면 커뮤니티와 프로필에서 더 자연스럽게 보입니다.",
      points: 10,
      earned: profile.displayName ? 10 : 0,
      completed: Boolean(profile.displayName),
      action: "displayName",
      actionLabel: profile.displayName ? "수정" : "입력",
    },
    {
      id: "resume",
      label: "이력서 등록",
      description:
        resumeCount > 0
          ? `이력서 ${resumeCount}개가 등록되어 있습니다.`
          : "이력서를 등록하면 지원 준비 상태를 바로 확인할 수 있습니다.",
      points: 20,
      earned: resumeCount > 0 ? 20 : 0,
      completed: resumeCount > 0,
      action: "resume",
      actionLabel: resumeCount > 0 ? "추가" : "등록",
    },
    {
      id: "cpa-verification",
      label: "CPA 검증 상태 확인",
      description:
        profile.cpaVerificationStatus === "CPA_VERIFIED"
          ? "CPA 검증이 완료되어 신뢰 배지가 활성화되었습니다."
          : profile.cpaVerificationStatus === "PENDING"
            ? "검증 요청이 접수되어 절반의 진행도를 인정합니다."
            : "검증 상태를 확인하면 수습 CPA 방 접근도 준비할 수 있습니다.",
      points: 20,
      earned: cpaEarned,
      completed: profile.cpaVerificationStatus === "CPA_VERIFIED",
      action: "cpa",
      actionLabel:
        profile.cpaVerificationStatus === "CPA_VERIFIED" ? "보기" : "확인",
    },
    {
      id: "bookmarks",
      label: "관심 공고/회사 저장",
      description:
        bookmarkCount >= 3
          ? "관심 항목 3개 이상을 저장했습니다."
          : `관심 항목을 ${Math.max(3 - bookmarkCount, 0)}개 더 저장하면 만점입니다.`,
      points: 15,
      earned: bookmarkEarned,
      completed: bookmarkEarned === 15,
      action: "jobs",
      actionLabel: "찾기",
      href: "/jobs",
    },
    {
      id: "community",
      label: "커뮤니티 활동 남기기",
      description:
        communityActivityTotal >= 3
          ? "커뮤니티 활동 3건 이상으로 활동성이 보입니다."
          : `활동을 ${Math.max(3 - communityActivityTotal, 0)}건 더 남기면 만점입니다.`,
      points: 15,
      earned: communityEarned,
      completed: communityEarned === 15,
      action: "community",
      actionLabel: "이동",
      href: "/community",
    },
  ];
  const score = steps.reduce((total, step) => total + step.earned, 0);

  return {
    score,
    level:
      score === 100
        ? "프로필 완성"
        : score >= 75
          ? "거의 완성"
          : score >= 45
            ? "꾸미는 중"
            : "첫 설정 중",
    reason:
      score === 100
        ? "모든 활용 신호가 채워져 완성 배지를 받았습니다."
        : score >= 75
          ? "마지막 몇 가지 활동만 채우면 완성 배지를 받을 수 있습니다."
          : score >= 45
            ? "기본 정보는 갖춰졌고, 활동 신호를 더하면 점수가 빠르게 오릅니다."
            : "사진, 표시이름, 이력서부터 채우면 마이페이지가 바로 살아납니다.",
    nextStep: steps.find((step) => !step.completed) ?? null,
    steps,
  };
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function formatDate(iso: string) {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function validateResumeFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !RESUME_EXTENSIONS.has(extension)) {
    return "이력서는 PDF, DOC, DOCX, HWP, HWPX 파일만 업로드할 수 있습니다.";
  }
  if (file.size <= 0) {
    return "빈 이력서 파일은 업로드할 수 없습니다.";
  }
  if (file.size > RESUME_MAX_BYTES) {
    return "이력서는 10MB 이하로 업로드해주세요.";
  }
  return "";
}

function validateProfileImage(file: File) {
  if (!PROFILE_IMAGE_TYPES.has(file.type)) {
    return "프로필 사진은 PNG, JPG, WEBP, GIF 파일만 업로드할 수 있습니다.";
  }
  if (file.size <= 0) {
    return "빈 이미지 파일은 업로드할 수 없습니다.";
  }
  if (file.size > PROFILE_IMAGE_MAX_BYTES) {
    return "프로필 사진은 1.5MB 이하로 업로드해주세요.";
  }
  return "";
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("이미지 파일을 읽지 못했습니다."));
      }
    });
    reader.addEventListener("error", () => {
      reject(new Error("이미지 파일을 읽지 못했습니다."));
    });
    reader.readAsDataURL(file);
  });
}
