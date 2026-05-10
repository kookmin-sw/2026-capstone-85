import type {
  BoardType,
  CommunityAnswer,
  CommunityPost,
  CreateAnswerInput,
  CreatePostInput,
  SortOrder,
} from "./community-types";
import { mockAnswers, mockPosts } from "./community-data";

// TODO: replace mock getPosts with GET /api/community/posts
export function getPosts(options: {
  board?: BoardType;
  search?: string;
  sort?: SortOrder;
}): CommunityPost[] {
  let posts = [...mockPosts];

  if (options.board) {
    posts = posts.filter((p) => p.boardType === options.board);
  }

  if (options.search) {
    const q = options.search.toLowerCase();
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  if (options.sort === "popular") {
    posts.sort((a, b) => b.likeCount - a.likeCount);
  } else {
    posts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  return posts;
}

// TODO: replace mock getPost with GET /api/community/posts/:id
export function getPost(id: string): CommunityPost | undefined {
  return mockPosts.find((p) => p.id === id);
}

// TODO: replace mock getAnswers with GET /api/community/posts/:id/answers
export function getAnswers(postId: string): CommunityAnswer[] {
  return mockAnswers
    .filter((a) => a.postId === postId)
    .sort((a, b) => {
      if (a.isAccepted && !b.isAccepted) return -1;
      if (!a.isAccepted && b.isAccepted) return 1;
      return b.likeCount - a.likeCount;
    });
}

// TODO: replace mock createPost with POST /api/community/posts
export function createPost(input: CreatePostInput): CommunityPost {
  const post: CommunityPost = {
    id: `p${Date.now()}`,
    boardType: input.boardType,
    title: input.title,
    content: input.content,
    status: input.boardType === "FREE" ? "FREE" : "QUESTION",
    tags: input.tags,
    authorName: input.isAnonymous ? "익명" : input.authorName,
    isAnonymous: input.isAnonymous,
    createdAt: new Date().toISOString(),
    viewCount: 0,
    commentCount: 0,
    likeCount: 0,
    isResolved: false,
  };
  mockPosts.unshift(post);
  return post;
}

// TODO: replace mock createAnswer with POST /api/community/posts/:id/answers
export function createAnswer(input: CreateAnswerInput): CommunityAnswer {
  const answer: CommunityAnswer = {
    id: `a${Date.now()}`,
    postId: input.postId,
    content: input.content,
    authorName: input.isAnonymous ? "익명" : input.authorName,
    isAnonymous: input.isAnonymous,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    isAccepted: false,
  };
  mockAnswers.push(answer);
  const post = mockPosts.find((p) => p.id === input.postId);
  if (post) post.commentCount += 1;
  return answer;
}

// TODO: replace mock resolvePost with PATCH /api/community/posts/:id/resolve
export function resolvePost(postId: string, answerId: string): void {
  const post = mockPosts.find((p) => p.id === postId);
  if (post) {
    post.isResolved = true;
    post.status = "ANSWERED";
    post.acceptedAnswerId = answerId;
  }
  mockAnswers.forEach((a) => {
    if (a.postId === postId) a.isAccepted = false;
  });
  const answer = mockAnswers.find((a) => a.id === answerId);
  if (answer) answer.isAccepted = true;
}

// TODO: replace mock likePost with POST /api/community/posts/:id/like
export function likePost(postId: string): void {
  const post = mockPosts.find((p) => p.id === postId);
  if (post) post.likeCount += 1;
}

// TODO: replace mock likeAnswer with POST /api/community/answers/:id/like
export function likeAnswer(answerId: string): void {
  const answer = mockAnswers.find((a) => a.id === answerId);
  if (answer) answer.likeCount += 1;
}

export function incrementViewCount(postId: string): void {
  const post = mockPosts.find((p) => p.id === postId);
  if (post) post.viewCount += 1;
}

export function getTrendingPosts(): CommunityPost[] {
  return [...mockPosts]
    .sort((a, b) => b.likeCount + b.commentCount - (a.likeCount + a.commentCount))
    .slice(0, 5);
}
