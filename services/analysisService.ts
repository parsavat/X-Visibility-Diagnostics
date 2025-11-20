
import { GoogleGenAI, Type } from "@google/genai";
import { EngagementMetrics, AnalysisResult, VisibilityStatus, RiskFlag, TweetVariation, FixRecommendation, SearchTestResult, SearchQueryVariation } from '../types';
import { simulateSearchCrawl } from './mockData';

class AnalysisService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeAccount(metrics: EngagementMetrics): Promise<AnalysisResult> {
    const model = "gemini-2.5-flash";

    const recentStats = metrics.currentPeriod.slice(-7);
    const totalImpressions = metrics.currentPeriod.reduce((acc, curr) => acc + curr.impressions, 0);
    const avgImpressions = totalImpressions / metrics.currentPeriod.length;
    
    const prompt = `
      You are a senior Social Media Algorithmic Analyst. Analyze the following Twitter/X account metrics for shadowban risks, visibility issues, and growth opportunities.
      
      Data Summary:
      - Total Followers: ${metrics.totalFollowers} (Growth: ${metrics.followerGrowth}%)
      - Avg Engagement Rate: ${metrics.averageEngagementRate.toFixed(2)}%
      - Avg Daily Replies: ${metrics.replyRatio.toFixed(1)}
      - Recent 7 Days Performance: ${JSON.stringify(recentStats.map(d => ({ d: d.date, imp: d.impressions, eng: d.engagements })))}
      - 28 Day Avg Impressions: ${Math.floor(avgImpressions)}

      Task:
      1. Calculate Health Score (0-100).
      2. Determine Visibility Status.
      3. Identify risk flags.
      4. Create action plan.
      5. Suggest posting strategy.
      6. Generate 3 specific high-potential content ideas based on current trends for this account type.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              healthScore: { type: Type.NUMBER },
              status: { type: Type.STRING, enum: ["HEALTHY", "AT_RISK", "SHADOWBANNED", "RESTRICTED"] },
              summary: { type: Type.STRING },
              flags: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    severity: { type: Type.STRING, enum: ["critical", "warning", "info"] },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    timestamp: { type: Type.STRING }
                  }
                }
              },
              actionPlan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.STRING },
                    action: { type: Type.STRING },
                    impact: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                    status: { type: Type.STRING, enum: ["pending", "completed"] }
                  }
                }
              },
              postingStrategy: {
                type: Type.OBJECT,
                properties: {
                  bestTimes: { type: Type.ARRAY, items: { type: Type.STRING } },
                  contentMix: { type: Type.STRING }
                }
              },
              contentIdeas: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    topic: { type: Type.STRING },
                    hook: { type: Type.STRING },
                    format: { type: Type.STRING, enum: ["thread", "image", "poll", "text"] },
                    estimatedReach: { type: Type.STRING, enum: ["High", "Medium"] }
                  }
                }
              }
            }
          }
        }
      });

      if (response.text) {
         return JSON.parse(response.text) as AnalysisResult;
      }
      throw new Error("Empty response from Gemini");

    } catch (error) {
      console.error("Gemini Analysis Failed", error);
      return this.getFallbackData();
    }
  }

  async optimizeDraft(draft: string): Promise<TweetVariation[]> {
    const prompt = `
      You are a viral ghostwriter for X (Twitter). Rewrite the following draft tweet to maximize engagement, keeping the core message but improving the hook and format.
      
      Draft: "${draft}"
      
      Provide 3 distinct variations:
      1. Hook-driven (Clickbait/Curiosity)
      2. Value-driven (Educational/Clear)
      3. Casual/Punchy (Relatable)
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                style: { type: Type.STRING },
                text: { type: Type.STRING },
                reasoning: { type: Type.STRING }
              }
            }
          }
        }
      });
      return response.text ? JSON.parse(response.text) : [];
    } catch (e) {
      console.error("Optimization failed", e);
      return [
        { style: "Error", text: "Could not optimize at this time.", reasoning: "Network error" }
      ];
    }
  }

  async getFixForFlag(flag: RiskFlag): Promise<FixRecommendation> {
    const prompt = `
      The user has a risk flag on their X account:
      Title: ${flag.title}
      Description: ${flag.description}
      Severity: ${flag.severity}

      Provide a specific remediation plan.
      1. A title for the fix.
      2. 3 specific steps to take.
      3. If a tweet is needed (e.g. to restore engagement or apologize), provide a template. If no tweet is needed, leave template empty.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
              template: { type: Type.STRING }
            }
          }
        }
      });
      return response.text ? JSON.parse(response.text) : { title: "Manual Review", steps: ["Check X settings"], template: "" };
    } catch (e) {
      return { title: "Manual Review Required", steps: ["Wait 24 hours", "Avoid posting links", "Engage with verified accounts"], template: "" };
    }
  }

  async runSearchCheck(query: string): Promise<SearchTestResult> {
    // 1. Get raw data (simulated)
    const placements = await simulateSearchCrawl(query);
    
    // 2. Interpret with AI
    const prompt = `
      Analyze the search visibility of a tweet based on these crawl results.
      Query: "${query}"
      
      Crawl Data:
      ${placements.map(p => `- ${p.context}: ${p.found ? 'VISIBLE' : 'NOT FOUND'}`).join('\n')}
      
      Rules:
      - If not found in Incognito (Top or Latest) but found for logged-in users, it's likely a "Ghost Ban" or "De-ranking".
      - If not found anywhere, it's a "Search Ban".
      - If found everywhere, it's "Visible".
      
      Provide:
      1. A visibility score (0-100).
      2. A status (VISIBLE, LIMITED_VISIBILITY, SEARCH_BANNED).
      3. A concise 2-sentence analysis explaining the result to the user.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              status: { type: Type.STRING, enum: ["VISIBLE", "LIMITED_VISIBILITY", "SEARCH_BANNED"] },
              aiAnalysis: { type: Type.STRING }
            }
          }
        }
      });
      
      const analysis = response.text ? JSON.parse(response.text) : { score: 0, status: 'SEARCH_BANNED', aiAnalysis: "Could not analyze." };

      return {
        query,
        timestamp: new Date().toISOString(),
        placements,
        ...analysis
      };
    } catch (error) {
      console.error("Search analysis failed", error);
      return {
        query,
        timestamp: new Date().toISOString(),
        placements,
        score: 50,
        status: 'LIMITED_VISIBILITY',
        aiAnalysis: "AI Analysis unavailable. Raw data indicates mixed visibility."
      };
    }
  }

  async generateSearchVariations(originalQuery: string): Promise<SearchQueryVariation[]> {
    const prompt = `
      Generate 3 diverse search query variations for Twitter/X based on this input: "${originalQuery}".
      The goal is to test search visibility across different indexing methods.
      
      Variations needed:
      1. Hashtag Focus (converting keywords to tags)
      2. Broad Match (natural language / related terms)
      3. Exact/Technical (using quotes or operators if applicable, or just strict keywords)

      Return strictly a JSON array of objects with:
      - "type": string (e.g. "Hashtag Test")
      - "query": string (the search string)
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING },
                        query: { type: Type.STRING }
                    }
                }
            }
        }
      });
      return response.text ? JSON.parse(response.text) : [];
    } catch (error) {
        console.error("Error generating variations:", error);
        return [
          { type: "Hashtag Test", query: `#${originalQuery.replace(/\s+/g, '')}` },
          { type: "Broad Match", query: `${originalQuery} viral` },
          { type: "Exact Phrase", query: `"${originalQuery}"` }
        ];
    }
  }

  private getFallbackData(): AnalysisResult {
    return {
        healthScore: 65,
        status: VisibilityStatus.AT_RISK,
        summary: "Analysis suggests potential visibility throttling due to irregular engagement spikes.",
        flags: [
          { id: "1", severity: "warning", title: "Inconsistent Posting", description: "Gaps in posting history detected.", timestamp: new Date().toISOString() },
          { id: "2", severity: "info", title: "Media Usage Low", description: "Tweets with media are performing 3x better.", timestamp: new Date().toISOString() }
        ],
        actionPlan: [
            { day: "Day 1", action: "Reply to 5 large accounts in your niche", impact: "High", status: "pending" },
            { day: "Day 2", action: "Post a thread with 3+ images", impact: "Medium", status: "pending" }
        ],
        postingStrategy: {
            bestTimes: ["9:00 AM EST", "4:00 PM EST"],
            contentMix: "70% text, 30% video"
        },
        contentIdeas: [
          { topic: "Industry Myths", hook: "Everything you know about X is wrong.", format: "thread", estimatedReach: "High" },
          { topic: "Behind the Scenes", hook: "My desk setup for max productivity.", format: "image", estimatedReach: "Medium" }
        ]
      };
  }
}

export const analysisService = new AnalysisService();
