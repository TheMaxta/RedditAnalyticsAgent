export interface PostThemes {
  isSolutionRequest: boolean;
  isPainOrAnger: boolean;
  isAdviceRequest: boolean;
  isMoneyTalk: boolean;
}

export interface ThemeAnalysis {
  id: string;
  post_id: string;
  categories: {
    isSolutionRequest: boolean;
    isPainOrAnger: boolean;
    isAdviceRequest: boolean;
    isMoneyTalk: boolean;
    isResearch: boolean;
    isDiscussion: boolean;
    hasVideoContent: boolean;
  };
  reasoning: {
    solutionRequest?: string | null;
    painOrAnger?: string | null;
    adviceRequest?: string | null;
    moneyTalk?: string | null;
    research?: string | null;
    discussion?: string | null;
    videoContent?: string | null;
  };
  posts?: {
    id: string;
    title: string;
    url: string;
    score: number;
  };
} 