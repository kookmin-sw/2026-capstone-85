"use client";

import { Check, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { ActionButton, ActionLink } from "@/components/ui/action-button";
import { createPost } from "@/lib/community-api";
import {
  BOARD_TYPES,
  boardTags,
  boardTypeLabels,
  type BoardType,
} from "@/lib/community-types";
import styles from "./community-write.module.css";

function CommunityWriteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialBoard = (searchParams.get("board") as BoardType | null) ?? "CPA_PREP";

  const [activeBoard, setActiveBoard] = useState<BoardType>(initialBoard);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const availableTags = boardTags[activeBoard];

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function handleBoardChange(board: BoardType) {
    setActiveBoard(board);
    setSelectedTags([]);
  }

  function handleSubmit() {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    const post = createPost({
      boardType: activeBoard,
      title: title.trim(),
      content: content.trim(),
      tags: selectedTags,
      isAnonymous,
      authorName: "익명",
    });
    router.push(`/community?board=${activeBoard}`);
    void post;
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <SiteNav />

      <div className="border-b border-[var(--app-line)] bg-[var(--background)]">
        <div className="mx-auto max-w-7xl px-6 pt-5 pb-0">
          <nav className="mb-4 flex items-center gap-1 text-sm text-gray-500">
            <Link href="/" className="flex items-center hover:text-gray-700">
              <Home size={14} />
            </Link>
            <ChevronRight size={13} className="text-gray-300" />
            <Link href="/community" className="hover:text-gray-700">
              커뮤니티
            </Link>
            <ChevronRight size={13} className="text-gray-300" />
            <Link
              href={`/community?board=${activeBoard}`}
              className="hover:text-gray-700"
            >
              {boardTypeLabels[activeBoard]}
            </Link>
            <ChevronRight size={13} className="text-gray-300" />
            <span className="font-semibold text-gray-800">글쓰기</span>
          </nav>

          <div className="flex overflow-x-auto border-b border-[var(--app-line)]">
            {BOARD_TYPES.map((board) => (
              <button
                key={board}
                type="button"
                onClick={() => handleBoardChange(board)}
                className={`flex-none whitespace-nowrap border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
                  activeBoard === board
                    ? "border-[var(--brand)] text-[var(--brand)]"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                } -mb-px`}
              >
                {boardTypeLabels[board]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className={styles.layout}>
          <div className={styles.form}>
            <div className={styles.formInner}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>
                  제목 <span className={styles.required}>*</span>
                </label>
                <input
                  className={styles.formInput}
                  placeholder="제목을 입력해주세요."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
                <p className={styles.charCount}>{title.length}/100</p>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>
                  카테고리{" "}
                  <span className={styles.optional}>(선택)</span>
                </label>
                <div className={styles.tagGrid}>
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`${styles.tagChip} ${
                        selectedTags.includes(tag) ? styles.tagChipSelected : ""
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>
                  내용 <span className={styles.required}>*</span>
                </label>
                <textarea
                  className={styles.formTextarea}
                  placeholder="내용을 입력해주세요."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={5000}
                />
                <p className={styles.charCount}>{content.length}/5000</p>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>
                  익명 설정
                </label>
                <label className={styles.anonymousRow}>
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  <span className={styles.anonymousLabel}>
                    익명으로 게시글을 작성합니다.
                  </span>
                </label>
                <p className={styles.anonymousHint}>
                  • 개인 정보는 노출되지 않으며, 닉네임은 &apos;익명&apos;으로 표시됩니다.
                </p>
              </div>
            </div>

            <div className={styles.formFooter}>
              <ActionLink href={`/community?board=${activeBoard}`} variant="subtle">
                취소
              </ActionLink>
              <ActionButton
                type="button"
                disabled={submitting || !title.trim() || !content.trim()}
                onClick={handleSubmit}
              >
                등록하기
              </ActionButton>
            </div>
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <p className={styles.sidebarCardTitle}>게시글 작성 가이드</p>
              <div className={styles.guideList}>
                {[
                  { icon: "?", title: "구체적으로 작성해 주세요", desc: "상황, 배경, 질문을 구체적으로 적을수록 더 정확한 답변을 받을 수 있어요." },
                  { icon: "🔍", title: "검색 후 질문해 주세요", desc: "이미 답변된 질문일 수 있어요. 검색 후 질문하면 더 좋아요." },
                  { icon: "#", title: "관련 태그를 활용해주세요", desc: "적절한 태그는 유사한 질문을 받은 전문가에게 노출될 확률을 높여요." },
                  { icon: "✓", title: "커뮤니티 규칙을 지켜주세요", desc: "비방, 광고, 욕설 등은 제재 대상이 될 수 있습니다." },
                ].map((guide) => (
                  <div key={guide.title} className={styles.guideItem}>
                    <div className={styles.guideIcon}>{guide.icon}</div>
                    <div className={styles.guideText}>
                      <p className={styles.guideTextTitle}>{guide.title}</p>
                      <p className={styles.guideTextDesc}>{guide.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.sidebarCard}>
              <p className={styles.sidebarCardTitle}>이런 질문이 더 좋아요!</p>
              <div className={styles.goodExamples}>
                {[
                  '"OO 회계법인 실무수습은 어떤가요?"',
                  '"1차 시험 공부 시간 배분 어떻게 하시나요?"',
                  '"세법 선택과목 어떤 걸 추천하시나요?"',
                ].map((ex) => (
                  <div key={ex} className={styles.goodExample}>
                    <Check size={13} className={styles.goodExampleCheck} />
                    {ex}
                  </div>
                ))}
              </div>
              <p className={styles.goodExampleHint}>
                구체적인 질문일수록 좋은 답변을 받을 확률이 높아져요!
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function CommunityWritePage() {
  return (
    <Suspense>
      <CommunityWriteContent />
    </Suspense>
  );
}
