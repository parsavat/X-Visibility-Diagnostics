import { MetricData, EngagementMetrics, SearchPlacement } from '../types';

// Helper to generate random dates and values
const generateTimeSeriesData = (days: number): MetricData[] => {
  const data: MetricData[] = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Simulate some volatility
    const baseImpressions = 1000 + Math.random() * 5000;
    const spike = Math.random() > 0.9 ? 10000 : 0; // Occasional viral tweet
    const impressions = Math.floor(baseImpressions + spike);
    
    data.push({
      date: date.toISOString().split('T')[0],
      impressions: impressions,
      engagements: Math.floor(impressions * (0.02 + Math.random() * 0.05)),
      likes: Math.floor(impressions * (0.01 + Math.random() * 0.03)),
      replies: Math.floor(impressions * (0.005 + Math.random() * 0.01)),
      retweets: Math.floor(impressions * (0.002 + Math.random() * 0.01)),
      profileVisits: Math.floor(impressions * 0.1),
    });
  }
  return data;
};

export const getMockTwitterData = async (): Promise<EngagementMetrics> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const currentPeriod = generateTimeSeriesData(28);
  const previousPeriod = generateTimeSeriesData(28);

  // Calculate derived stats
  const totalImpressions = currentPeriod.reduce((sum, d) => sum + d.impressions, 0);
  const totalEngagements = currentPeriod.reduce((sum, d) => sum + d.engagements, 0);
  const totalReplies = currentPeriod.reduce((sum, d) => sum + d.replies, 0);
  
  // Intentionally create a scenario that looks slightly suspicious for the demo
  // High impression drop-off or low reply rate
  
  return {
    currentPeriod,
    previousPeriod,
    totalFollowers: 12450,
    followerGrowth: 1.2,
    averageEngagementRate: (totalEngagements / totalImpressions) * 100,
    replyRatio: totalReplies / 28, // approx replies per day
  };
};

export const simulateSearchCrawl = async (query: string): Promise<SearchPlacement[]> => {
    await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate scraping delay
    
    // Deterministic mock based on query length/content to allow user to "test" different outcomes
    const isRisky = query.toLowerCase().includes('crypto') || query.toLowerCase().includes('giveaway') || query.toLowerCase().includes('follow');
    
    return [
        { context: "Incognito Mode - Top Tab", found: isRisky ? false : Math.random() > 0.3 },
        { context: "Incognito Mode - Latest Tab", found: isRisky ? false : Math.random() > 0.2 },
        { context: "Logged In (Non-Follower View)", found: isRisky ? false : true },
        { context: "Logged In (Follower View)", found: true },
        { context: "Global Search (US Region)", found: isRisky ? false : Math.random() > 0.1 },
        { context: "Hashtag Feed", found: isRisky ? false : true }
    ];
};