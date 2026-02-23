import { NextRequest, NextResponse } from 'next/server';
import { enhancedAgenticSearchManager } from '@/lib/enhancedAgenticSearch';

export async function POST(req: NextRequest) {
  try {
    const { 
      query, 
      agentType, 
      enableWebScraping, 
      maxIterations,
      includeRealTimeData = true,
      collaborativeMode = false,
      sessionId,
      searchDepth = 3
    } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    console.log('Enhanced agentic search request:', { 
      query, 
      agentType, 
      enableWebScraping, 
      includeRealTimeData,
      collaborativeMode,
      sessionId 
    });

    let searchResult;

    if (collaborativeMode) {
      searchResult = await enhancedAgenticSearchManager.performCollaborativeSearch(query, sessionId);
    } else {
      searchResult = await enhancedAgenticSearchManager.performEnhancedSearch(query, {
        agentType,
        includeRealTimeData,
        searchDepth,
        maxIterations
      });
    }

    const response = {
      success: true,
      content: searchResult.content,
      agent: searchResult.agent || searchResult.agentType,
      confidence: searchResult.confidence,
      metadata: {
        ...searchResult.metadata,
        agentType: searchResult.agent || searchResult.agentType,
        webScrapingEnabled: enableWebScraping,
        sourcesCount: searchResult.sources?.length || 0,
        includeRealTimeData,
        collaborativeMode
      },
      sources: searchResult.sources || [],
      insights: searchResult.insights || [],
      recommendations: searchResult.recommendations || [],
      semanticAnalysis: searchResult.semanticAnalysis,
      realTimeData: searchResult.realTimeData,
      sessionId: searchResult.sessionId
    };

    console.log('Enhanced agentic search completed:', {
      agent: response.agent,
      confidence: searchResult.confidence,
      contentLength: searchResult.content.length,
      insightsCount: response.insights.length,
      recommendationsCount: response.recommendations.length
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('Enhanced agentic search error:', error);
    return NextResponse.json(
      { error: `Enhanced agentic search failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Get search insights for query analysis
    const insights = await enhancedAgenticSearchManager.getSearchInsights(query);
    
    return NextResponse.json({
      success: true,
      insights
    });

  } catch (error) {
    console.error('Error getting search insights:', error);
    return NextResponse.json(
      { error: 'Failed to get search insights' },
      { status: 500 }
    );
  }
} 