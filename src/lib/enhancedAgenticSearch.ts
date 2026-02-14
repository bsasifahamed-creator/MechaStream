import { agenticSearchManager } from './agenticSearch';

// Enhanced Semantic Analysis
export class SemanticAnalyzer {
  private semanticKeywords: Map<string, string[]> = new Map([
    ['technical', ['api', 'function', 'method', 'class', 'module', 'library', 'framework', 'code', 'implementation', 'algorithm', 'data structure']],
    ['creative', ['design', 'creative', 'inspiration', 'art', 'beautiful', 'style', 'aesthetic', 'visual', 'ui', 'ux', 'branding']],
    ['research', ['study', 'analysis', 'research', 'investigation', 'exploration', 'discovery', 'evidence', 'fact', 'data']],
    ['business', ['strategy', 'market', 'business', 'startup', 'entrepreneur', 'revenue', 'growth', 'investment', 'competition']],
    ['academic', ['thesis', 'paper', 'academic', 'scholarly', 'peer-reviewed', 'citation', 'research', 'methodology']]
  ]);

  analyzeQuerySemantics(query: string): { category: string; confidence: number; keywords: string[] } {
    const queryLower = query.toLowerCase();
    let bestCategory = 'research';
    let bestConfidence = 0;
    let matchedKeywords: string[] = [];

    for (const [category, keywords] of this.semanticKeywords) {
      const matches = keywords.filter(keyword => queryLower.includes(keyword));
      const confidence = matches.length / keywords.length;
      
      if (confidence > bestConfidence) {
        bestConfidence = confidence;
        bestCategory = category;
        matchedKeywords = matches;
      }
    }

    return {
      category: bestCategory,
      confidence: bestConfidence,
      keywords: matchedKeywords
    };
  }

  extractEntities(text: string): string[] {
    const entities: string[] = [];
    const words = text.split(/\s+/);
    
    words.forEach(word => {
      if (word.length > 3 && /^[A-Z]/.test(word)) {
        entities.push(word);
      }
    });

    return [...new Set(entities)];
  }
}

// Real-time Data Integration
export class RealTimeDataIntegrator {
  async getTrendingTopics(): Promise<string[]> {
    try {
      return [
        'artificial intelligence',
        'machine learning',
        'web development',
        'data science',
        'cybersecurity',
        'blockchain',
        'cloud computing',
        'mobile development'
      ];
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      return [];
    }
  }

  async getRecentNews(query: string): Promise<string[]> {
    try {
      const newsKeywords = query.toLowerCase().split(' ');
      const mockNews = [
        'Latest developments in AI technology',
        'New programming frameworks released',
        'Industry trends in software development',
        'Innovation in web technologies'
      ];
      
      return mockNews.filter(news => 
        newsKeywords.some(keyword => news.toLowerCase().includes(keyword))
      );
    } catch (error) {
      console.error('Error fetching recent news:', error);
      return [];
    }
  }
}

// Collaborative Search Features
export class CollaborativeSearch {
  private searchSessions: Map<string, any> = new Map();

  async createSearchSession(query: string, userId?: string): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.searchSessions.set(sessionId, {
      query,
      userId,
      createdAt: new Date(),
      participants: userId ? [userId] : [],
      searchResults: [],
      insights: []
    });

    return sessionId;
  }

  async addParticipant(sessionId: string, userId: string): Promise<boolean> {
    const session = this.searchSessions.get(sessionId);
    if (session && !session.participants.includes(userId)) {
      session.participants.push(userId);
      return true;
    }
    return false;
  }

  async addInsight(sessionId: string, insight: string, userId?: string): Promise<void> {
    const session = this.searchSessions.get(sessionId);
    if (session) {
      session.insights.push({
        text: insight,
        userId,
        timestamp: new Date()
      });
    }
  }
}

// Enhanced Search Manager with Advanced Capabilities
export class EnhancedAgenticSearchManager {
  private semanticAnalyzer = new SemanticAnalyzer();
  private realTimeIntegrator = new RealTimeDataIntegrator();
  private collaborativeSearch = new CollaborativeSearch();

  async performEnhancedSearch(query: string, options: any = {}): Promise<any> {
    // Semantic analysis
    const semanticAnalysis = this.semanticAnalyzer.analyzeQuerySemantics(query);
    
    // Real-time data integration
    const trendingTopics = await this.realTimeIntegrator.getTrendingTopics();
    const recentNews = await this.realTimeIntegrator.getRecentNews(query);
    
    // Perform base search
    const baseResult = await agenticSearchManager.performAgenticSearch(query, options.agentType || 'auto');
    
    // Enhance with real-time data
    let enhancedContent = baseResult.content;
    if (options.includeRealTimeData !== false) {
      if (trendingTopics.some(topic => query.toLowerCase().includes(topic))) {
        enhancedContent += '\n\n📈 Trending Related Topics:\n' + trendingTopics.slice(0, 3).join(', ');
      }
      
      if (recentNews.length > 0) {
        enhancedContent += '\n\n📰 Recent News:\n' + recentNews.slice(0, 2).join('\n');
      }
    }
    
    // Add semantic insights
    const insights = [
      ...(baseResult.insights || []),
      `🔍 Query categorized as: ${semanticAnalysis.category} (confidence: ${(semanticAnalysis.confidence * 100).toFixed(1)}%)`,
      `🎯 Semantic keywords detected: ${semanticAnalysis.keywords.join(', ')}`
    ];
    
    // Generate recommendations based on semantic analysis
    const recommendations = this.generateRecommendations(query, semanticAnalysis);
    
    return {
      ...baseResult,
      content: enhancedContent,
      insights,
      recommendations,
      semanticAnalysis,
      realTimeData: {
        trendingTopics: trendingTopics.filter(topic => query.toLowerCase().includes(topic)),
        recentNews
      }
    };
  }

  private generateRecommendations(query: string, semanticAnalysis: any): string[] {
    const recommendations: string[] = [];
    
    if (semanticAnalysis.category === 'technical') {
      recommendations.push('🔧 Consider exploring related APIs and documentation');
      recommendations.push('💻 Look for code examples and implementation guides');
      recommendations.push('📚 Check official documentation for best practices');
    } else if (semanticAnalysis.category === 'creative') {
      recommendations.push('🎨 Explore design inspiration from similar projects');
      recommendations.push('✨ Consider current design trends and best practices');
      recommendations.push('🎯 Focus on user experience and accessibility');
    } else if (semanticAnalysis.category === 'research') {
      recommendations.push('📊 Verify information from multiple sources');
      recommendations.push('🔬 Look for peer-reviewed studies and academic papers');
      recommendations.push('📈 Consider recent developments and trends');
    }
    
    return recommendations;
  }

  async performCollaborativeSearch(query: string, sessionId?: string): Promise<any> {
    if (!sessionId) {
      sessionId = await this.collaborativeSearch.createSearchSession(query);
    }
    
    const result = await this.performEnhancedSearch(query, { collaborativeMode: true });
    
    await this.collaborativeSearch.addInsight(sessionId, `Search completed for: ${query}`);
    
    return {
      ...result,
      sessionId,
      insights: [...(result.insights || []), `🤝 Collaborative session: ${sessionId}`]
    };
  }

  async getSearchInsights(query: string): Promise<any> {
    const semanticAnalysis = this.semanticAnalyzer.analyzeQuerySemantics(query);
    const trendingTopics = await this.realTimeIntegrator.getTrendingTopics();
    const entities = this.semanticAnalyzer.extractEntities(query);
    
    return {
      semanticAnalysis,
      trendingTopics: trendingTopics.filter(topic => query.toLowerCase().includes(topic)),
      entities,
      recommendedAgents: this.getRecommendedAgents(query, semanticAnalysis)
    };
  }

  private getRecommendedAgents(query: string, semanticAnalysis: any): any[] {
    const agents = agenticSearchManager.getAvailableAgents();
    
    return agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      relevance: this.calculateAgentRelevance(query, agent, semanticAnalysis)
    })).sort((a, b) => b.relevance - a.relevance);
  }

  private calculateAgentRelevance(query: string, agent: any, semanticAnalysis: any): number {
    const queryLower = query.toLowerCase();
    let relevance = 0;
    
    // Check semantic category match
    if (semanticAnalysis.category === 'technical' && agent.id === 'technical') {
      relevance += 0.4;
    } else if (semanticAnalysis.category === 'creative' && agent.id === 'creative') {
      relevance += 0.4;
    }
    
    // Check capability matches
    agent.capabilities.forEach((capability: string) => {
      if (queryLower.includes(capability.replace(' ', ''))) {
        relevance += 0.2;
      }
    });
    
    return Math.min(relevance, 1);
  }
}

// Export the enhanced search manager
export const enhancedAgenticSearchManager = new EnhancedAgenticSearchManager(); 