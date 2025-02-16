export interface PostThemes {
  isSolutionRequest: boolean;
  isPainOrAnger: boolean;
  isAdviceRequest: boolean;
  isMoneyTalk: boolean;
}

export interface ThemeAnalysis {
  postId: string;
  title: string;
  categories: PostThemes;
  reasoning: {
    solutionRequest?: string | null;
    painOrAnger?: string | null;
    adviceRequest?: string | null;
    moneyTalk?: string | null;
  };
} 