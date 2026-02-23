import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const criteria = await request.json()
    
    // Mock custom recommendation based on criteria
    const recommendations = [
      {
        provider: 'google-cli',
        score: 0.94,
        factors: {
          performance: 0.96,
          cost: 0.85,
          reliability: 0.95,
          availability: 0.97,
          latency: 0.99
        },
        recommendations: [
          'Meets all specified criteria',
          'Excellent performance and reliability',
          'Suitable for production use'
        ]
      },
      {
        provider: 'openrouter',
        score: 0.91,
        factors: {
          performance: 0.89,
          cost: 0.90,
          reliability: 0.97,
          availability: 0.95,
          latency: 0.92
        },
        recommendations: [
          'High reliability score',
          'Good cost-to-performance ratio',
          'Consistent service quality'
        ]
      },
      {
        provider: 'deepseek',
        score: 0.87,
        factors: {
          performance: 0.83,
          cost: 0.95,
          reliability: 0.91,
          availability: 0.89,
          latency: 0.85
        },
        recommendations: [
          'Cost-effective option',
          'Good reliability for the price',
          'Suitable for non-critical workloads'
        ]
      }
    ]

    // Filter based on criteria
    let filteredRecommendations = recommendations

    if (criteria.minSuccessRate) {
      filteredRecommendations = filteredRecommendations.filter(rec => 
        rec.factors.reliability * 100 >= criteria.minSuccessRate
      )
    }

    if (criteria.excludedProviders) {
      filteredRecommendations = filteredRecommendations.filter(rec => 
        !criteria.excludedProviders.includes(rec.provider)
      )
    }

    if (criteria.preferredProviders) {
      // Boost scores for preferred providers
      filteredRecommendations = filteredRecommendations.map(rec => ({
        ...rec,
        score: criteria.preferredProviders.includes(rec.provider) ? rec.score * 1.1 : rec.score
      }))
    }

    // Sort by score
    filteredRecommendations.sort((a, b) => b.score - a.score)

    return NextResponse.json({ recommendations: filteredRecommendations })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate custom recommendation' },
      { status: 500 }
    )
  }
} 