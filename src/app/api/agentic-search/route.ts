import { NextRequest, NextResponse } from 'next/server';
import { agenticSearchManager, IntelligentWebScraper } from '@/lib/agenticSearch';

export async function POST(req: NextRequest) {
  try {
    const { query, agentType, enableWebScraping, maxIterations } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    console.log('Agentic search request:', { query, agentType, enableWebScraping, maxIterations });

    // Determine the best agent if not specified
    const selectedAgent = agentType || await agenticSearchManager.analyzeQuery(query);
    console.log('Selected agent:', selectedAgent);

    // Perform agentic search
    const searchResult = await agenticSearchManager.performAgenticSearch(query, selectedAgent);

    // Enhanced web scraping if enabled
    let scrapedContent = '';
    if (enableWebScraping && searchResult.sources.length > 0) {
      const scraper = new IntelligentWebScraper();
      
      // Try to scrape from the first few sources
      for (const source of searchResult.sources.slice(0, 3)) {
        if (source.startsWith('http')) {
          try {
            const scraped = await scraper.scrapeWithIntelligence(source, query);
            if (scraped) {
              scrapedContent += scraped + '\n\n';
            }
          } catch (error) {
            console.error('Web scraping error for source:', source, error);
          }
        }
      }
    }

    // Combine search results with scraped content
    const enhancedContent = searchResult.content + (scrapedContent ? '\n\nEnhanced with web scraping:\n' + scrapedContent : '');

    const response = {
      success: true,
      content: enhancedContent,
      agent: selectedAgent,
      confidence: searchResult.confidence,
      metadata: {
        ...searchResult.metadata,
        agentType: selectedAgent,
        webScrapingEnabled: enableWebScraping,
        sourcesCount: searchResult.sources.length
      },
      sources: searchResult.sources
    };

    console.log('Agentic search completed:', {
      agent: selectedAgent,
      confidence: searchResult.confidence,
      contentLength: enhancedContent.length
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('Agentic search error:', error);
    return NextResponse.json(
      { error: `Agentic search failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Return available agents
    const agents = agenticSearchManager.getAvailableAgents();
    
    return NextResponse.json({
      success: true,
      agents: agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        capabilities: agent.capabilities
      }))
    });

  } catch (error) {
    console.error('Error getting agents:', error);
    return NextResponse.json(
      { error: 'Failed to get available agents' },
      { status: 500 }
    );
  }
} 