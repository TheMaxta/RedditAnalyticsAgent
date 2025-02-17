export interface PostThemes {
  isSolutionRequest: boolean;
  isPainOrAnger: boolean;
  isAdviceRequest: boolean;
  isMoneyTalk: boolean;
}

export interface ThemeAnalysis {
  post_id: string;
  title: string;
  categories: {
    isSolutionRequest: boolean;
    isPainOrAnger: boolean;
    isAdviceRequest: boolean;
    isMoneyTalk: boolean;
  };
  reasoning: {
    solutionRequest?: string | null;
    painOrAnger?: string | null;
    adviceRequest?: string | null;
    moneyTalk?: string | null;
  };
} 