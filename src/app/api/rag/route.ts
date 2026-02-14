import { NextRequest, NextResponse } from 'next/server'
import { vectorStore } from '@/lib/vectorstore'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const tags = searchParams.get('tags')?.split(',') || []
    const language = searchParams.get('language')
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!query && tags.length === 0 && !language) {
      return NextResponse.json(
        { error: 'Query, tags, or language parameter is required' },
        { status: 400 }
      )
    }

    let results

    if (language) {
      results = await vectorStore.searchByLanguage(language, limit)
    } else if (tags.length > 0) {
      results = await vectorStore.searchByTags(tags, limit)
    } else {
      results = await vectorStore.search(query!, limit)
    }

    return NextResponse.json({
      success: true,
      results,
      count: results.length
    })
  } catch (error) {
    console.error('RAG search error:', error)
    return NextResponse.json(
      { error: 'Failed to search code snippets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, code, description, tags, language } = body

    if (!title || !code || !description || !tags || !language) {
      return NextResponse.json(
        { error: 'Title, code, description, tags, and language are required' },
        { status: 400 }
      )
    }

    const snippet = await vectorStore.addSnippet({
      title,
      code,
      description,
      tags: Array.isArray(tags) ? tags : [tags],
      language
    })

    return NextResponse.json({
      success: true,
      snippet
    }, { status: 201 })
  } catch (error) {
    console.error('Error adding snippet:', error)
    return NextResponse.json(
      { error: 'Failed to add code snippet' },
      { status: 500 }
    )
  }
} 