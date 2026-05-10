"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnswerList } from "./_components/answer-list";
import { DetailSidebar } from "./_components/detail-sidebar";
import { PostCard } from "./_components/post-card";
import { ReplyForm } from "./_components/reply-form";
import { isQABoard } from "./_lib/community-detail-utils";
import { SiteNav } from "@/components/site-nav";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  createAnswer,
  getAnswers,
  getPost,
  getPosts,
  incrementViewCount,
  likeAnswer,
  likePost,
  resolvePost,
} from "@/lib/community-api";
import {
  boardTypeLabels,
  type CommunityAnswer,
  type CommunityPost,
} from "@/lib/community-types";
import styles from "./community-detail.module.css";

function CommunityDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";

  const [post, setPost] = useState<CommunityPost | undefined>(() => getPost(id));
  const [answers, setAnswers] = useState<CommunityAnswer[]>(() => getAnswers(id));
  const [liked, setLiked] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyAnonymous, setReplyAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const relatedPosts = useMemo(
    () =>
      post
        ? getPosts({ board: post.boardType })
            .filter((p) => p.id !== post.id)
            .slice(0, 5)
        : [],
    [post],
  );

  useEffect(() => {
    if (id) incrementViewCount(id);
  }, [id]);

  if (!post) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <SiteNav />
        <div className={styles.pageWrap}>
          <p className="text-center text-[var(--app-muted)]">게시글을 찾을 수 없습니다.</p>
        </div>
      </main>
    );
  }

  function handleLikePost() {
    if (liked || !post) return;
    likePost(post.id);
    setPost({ ...post, likeCount: post.likeCount + 1 });
    setLiked(true);
  }

  function handleLikeAnswer(answerId: string) {
    likeAnswer(answerId);
    setAnswers((prev) =>
      prev.map((a) => (a.id === answerId ? { ...a, likeCount: a.likeCount + 1 } : a)),
    );
  }

  function handleAccept(answerId: string) {
    if (!post) return;
    resolvePost(post.id, answerId);
    setPost({ ...post, isResolved: true, status: "ANSWERED", acceptedAnswerId: answerId });
    setAnswers((prev) => prev.map((a) => ({ ...a, isAccepted: a.id === answerId })));
  }

  function handleSubmitReply() {
    if (!replyText.trim() || !post) return;
    setSubmitting(true);
    const answer = createAnswer({
      postId: post.id,
      content: replyText.trim(),
      isAnonymous: replyAnonymous,
      authorName: "익명",
    });
    setAnswers((prev) => [...prev, answer]);
    setPost((p) => (p ? { ...p, commentCount: p.commentCount + 1 } : p));
    setReplyText("");
    setSubmitting(false);
  }

  const showQA = isQABoard(post);

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <SiteNav />

      <Breadcrumb
        items={[
          { label: "커뮤니티", href: "/community" },
          { label: boardTypeLabels[post.boardType], href: `/community?board=${post.boardType}` },
        ]}
        current={post.title}
      />

      <div className={styles.pageWrap}>
        <div className={styles.layout}>
          <div className={styles.main}>
            <PostCard post={post} liked={liked} onLike={handleLikePost} />

            {showQA && (
              <AnswerList
                answers={answers}
                isResolved={post.isResolved}
                onLike={handleLikeAnswer}
                onAccept={handleAccept}
              />
            )}

            <ReplyForm
              isQA={showQA}
              value={replyText}
              anonymous={replyAnonymous}
              submitting={submitting}
              onChange={setReplyText}
              onAnonymousChange={setReplyAnonymous}
              onSubmit={handleSubmitReply}
            />
          </div>

          <DetailSidebar post={post} relatedPosts={relatedPosts} />
        </div>
      </div>
    </main>
  );
}

export default function CommunityDetailPage() {
  return (
    <Suspense>
      <CommunityDetailContent />
    </Suspense>
  );
}
