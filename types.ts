
export enum VisibilityStatus {
  HEALTHY = 'HEALTHY',
  AT_RISK = 'AT_RISK',
  SHADOWBANNED = 'SHADOWBANNED',
  RESTRICTED = 'RESTRICTED'
}

export interface TwitterCredentials {
  apiKey: string;
  apiSecret: string;
  bearerToken: string;
}

export interface MetricData {
  date: string;
  impressions: number;
  engagements: number;
  likes: number;
  replies: number;
  retweets: number;
  profileVisits: number;
}

export interface EngagementMetrics {
  currentPeriod: MetricData[];
  previousPeriod: MetricData[];
  totalFollowers: number;
  followerGrowth: number;
  averageEngagementRate: number;
  replyRatio: number; // Replied / Tweeted
}

export interface RiskFlag {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
}

export interface ActionPlanItem {
  day: string;
  action: string;
  impact: 'High' | 'Medium' | 'Low';
  status: 'pending' | 'completed';
}

export interface ContentIdea {
  topic: string;
  hook: string;
  format: 'thread' | 'image' | 'poll' | 'text';
  estimatedReach: 'High' | 'Medium';
}

export interface TweetVariation {
  style: string;
  text: string;
  reasoning: string;
}

export interface FixRecommendation {
  title: string;
  steps: string[];
  template?: string; // A tweet template to copy-paste if applicable
}

export interface SearchPlacement {
  context: string; // e.g., "Incognito - Top Tab"
  found: boolean;
}

export interface SearchTestResult {
  query: string;
  timestamp: string;
  placements: SearchPlacement[];
  status: 'VISIBLE' | 'LIMITED_VISIBILITY' | 'SEARCH_BANNED';
  score: number;
  aiAnalysis: string;
}

export interface SearchQueryVariation {
  type: string;
  query: string;
}

export interface AnalysisResult {
  healthScore: number;
  status: VisibilityStatus;
  summary: string;
  flags: RiskFlag[];
  actionPlan: ActionPlanItem[];
  postingStrategy: {
    bestTimes: string[];
    contentMix: string;
  };
  contentIdeas: ContentIdea[];
}
