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
  };
  reasoning: {
    solutionRequest?: string | null;
    adviceRequest?: string | null;
    painOrAnger?: string | null;
    moneyTalk?: string | null;
  };
  posts?: {
    id: string;
    title: string;
    url: string;
    score: number;
  };
} 