export type BoardType = "CPA_PREP" | "TRAINEE" | "SENIOR" | "FREE";
export type PostStatus = "QUESTION" | "ANSWERED" | "FREE" | "INFO";
export type SortOrder = "latest" | "popular";

export interface CommunityPost {
  id: string;
  boardType: BoardType;
  title: string;
  content: string;
  status: PostStatus;
  tags: string[];
  authorName: string;
  isAnonymous: boolean;
  createdAt: string;
  viewCount: number;
  commentCount: number;
  likeCount: number;
  isResolved: boolean;
  acceptedAnswerId?: string;
}

export interface CommunityAnswer {
  id: string;
  postId: string;
  content: string;
  authorName: string;
  isAnonymous: boolean;
  createdAt: string;
  likeCount: number;
  isAccepted: boolean;
}

export interface CreatePostInput {
  boardType: BoardType;
  title: string;
  content: string;
  tags: string[];
  isAnonymous: boolean;
  authorName: string;
}

export interface CreateAnswerInput {
  postId: string;
  content: string;
  isAnonymous: boolean;
  authorName: string;
}

export const BOARD_TYPES = ["CPA_PREP", "TRAINEE", "SENIOR", "FREE"] as const;

export const boardTypeLabels: Record<BoardType, string> = {
  CPA_PREP: "CPA 준비생 Q&A",
  TRAINEE: "수습 CPA Q&A",
  SENIOR: "시니어 회계사 Q&A",
  FREE: "자유게시판",
};

export const boardTags: Record<BoardType, string[]> = {
  CPA_PREP: ["#1차시험", "#2차시험", "#실무수습", "#Big4", "#인턴", "#공부전략", "#회계학", "#세법", "#재무관리", "#선택과목"],
  TRAINEE: ["#수습생활", "#팀배치", "#감사업무", "#야근", "#법인문화"],
  SENIOR: ["#이직", "#연봉", "#FAS", "#Deal", "#인하우스", "#커리어패스"],
  FREE: ["#잡담", "#후기", "#정보공유", "#회계사생활"],
};

export const popularTags = [
  "#1차시험", "#2차시험", "#실무수습", "#Big4",
  "#인턴", "#공부전략", "#회계학", "#세법",
  "#재무관리", "#선택과목",
];
