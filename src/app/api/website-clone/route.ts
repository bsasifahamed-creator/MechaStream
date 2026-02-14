import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'

interface CloneRequest {
  url: string
  includeAssets: boolean
  includeImages: boolean
  optimizeCode: boolean
}

interface CloneResult {
  success: boolean
  url: string
  title: string
  description: string
  html: string
  css: string
  js: string
  images: string[]
  assets: string[]
  structure: {
    pages: string[]
    components: string[]
    styles: string[]
  }
  metadata: {
    viewport: string
    theme: string
    framework: string
    libraries: string[]
  }
  downloadUrl?: string
  previewUrl?: string
}

export async function POST(req: NextRequest) {
  try {
    const { url, includeAssets, includeImages, optimizeCode }: CloneRequest = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    console.log('Website clone request:', { url, includeAssets, includeImages, optimizeCode })

    // Validate URL
    let targetUrl: URL
    try {
      targetUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL provided' }, { status: 400 })
    }

    // Fetch the website
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch website: ${response.status}` }, { status: 400 })
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract basic information
    const title = $('title').text() || 'Untitled Website'
    const description = $('meta[name="description"]').attr('content') || 'No description available'
    const viewport = $('meta[name="viewport"]').attr('content') || 'width=device-width, initial-scale=1'

    // Extract CSS
    let css = ''
    $('style').each((_, element) => {
      css += $(element).html() + '\n'
    })
    $('link[rel="stylesheet"]').each((_, element) => {
      const href = $(element).attr('href')
      if (href) {
        css += `/* External stylesheet: ${href} */\n`
      }
    })

    // Extract JavaScript
    let js = ''
    $('script').each((_, element) => {
      const src = $(element).attr('src')
      if (src) {
        js += `// External script: ${src}\n`
      } else {
        js += $(element).html() + '\n'
      }
    })

    // Extract images
    const images: string[] = []
    if (includeImages) {
      $('img').each((_, element) => {
        const src = $(element).attr('src')
        if (src) {
          const absoluteUrl = new URL(src, url).href
          images.push(absoluteUrl)
        }
      })
    }

    // Extract other assets
    const assets: string[] = []
    if (includeAssets) {
      $('link[rel="stylesheet"], script[src], link[rel="icon"], link[rel="preload"]').each((_, element) => {
        const href = $(element).attr('href') || $(element).attr('src')
        if (href) {
          const absoluteUrl = new URL(href, url).href
          assets.push(absoluteUrl)
        }
      })
    }

    // Detect framework and libraries
    const libraries: string[] = []
    const framework = detectFramework($ as any)
    
    // Detect common libraries
    if ($('script[src*="jquery"]').length > 0) libraries.push('jQuery')
    if ($('script[src*="react"]').length > 0) libraries.push('React')
    if ($('script[src*="vue"]').length > 0) libraries.push('Vue.js')
    if ($('script[src*="angular"]').length > 0) libraries.push('Angular')
    if ($('script[src*="bootstrap"]').length > 0) libraries.push('Bootstrap')
    if ($('script[src*="tailwind"]').length > 0) libraries.push('Tailwind CSS')

    // Analyze structure
    const structure = analyzeStructure($ as any)

    // Optimize code if requested
    let optimizedHtml = html
    let optimizedCss = css
    let optimizedJs = js

    if (optimizeCode) {
      optimizedHtml = optimizeHtml(html)
      optimizedCss = optimizeCss(css)
      optimizedJs = optimizeJs(js)
    }

    // Create result
    const result: CloneResult = {
      success: true,
      url: url,
      title: title,
      description: description,
      html: optimizedHtml,
      css: optimizedCss,
      js: optimizedJs,
      images,
      assets,
      structure,
      metadata: {
        viewport,
        theme: detectTheme($ as any),
        framework,
        libraries
      }
    }

    console.log('Website clone completed:', {
      url,
      title,
      imagesCount: images.length,
      assetsCount: assets.length,
      framework,
      libraries: libraries.length
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('Website clone error:', error)
    return NextResponse.json(
      { error: `Website cloning failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

function detectFramework($: cheerio.CheerioAPI): string {
  // Check for common framework indicators
  if ($('script[src*="react"]').length > 0 || $('[data-reactroot]').length > 0) {
    return 'React'
  }
  if ($('script[src*="vue"]').length > 0 || $('[v-]').length > 0) {
    return 'Vue.js'
  }
  if ($('script[src*="angular"]').length > 0 || $('[ng-]').length > 0) {
    return 'Angular'
  }
  if ($('script[src*="jquery"]').length > 0) {
    return 'jQuery'
  }
  if ($('script[src*="bootstrap"]').length > 0 || $('.bootstrap').length > 0) {
    return 'Bootstrap'
  }
  return 'Vanilla HTML/CSS/JS'
}

function detectTheme($: cheerio.CheerioAPI): string {
  // Check for dark/light theme indicators
  if ($('[data-theme="dark"]').length > 0 || $('.dark').length > 0) {
    return 'Dark'
  }
  if ($('[data-theme="light"]').length > 0 || $('.light').length > 0) {
    return 'Light'
  }
  return 'Default'
}

function analyzeStructure($: cheerio.CheerioAPI) {
  const pages: string[] = []
  const components: string[] = []
  const styles: string[] = []

  // Extract navigation links as potential pages
  $('nav a, .nav a, .navigation a').each((_, element) => {
    const href = $(element).attr('href')
    if (href && !href.startsWith('#')) {
      pages.push(href)
    }
  })

  // Extract common component classes
  $('[class]').each((_, element) => {
    const classes = $(element).attr('class')?.split(' ') || []
    classes.forEach(cls => {
      if (cls.includes('component') || cls.includes('widget') || cls.includes('card')) {
        components.push(cls)
      }
    })
  })

  // Extract style references
  $('link[rel="stylesheet"]').each((_, element) => {
    const href = $(element).attr('href')
    if (href) {
      styles.push(href)
    }
  })

  return {
    pages: Array.from(new Set(pages)).slice(0, 10),
    components: Array.from(new Set(components)).slice(0, 10),
    styles: Array.from(new Set(styles)).slice(0, 10)
  }
}

function optimizeHtml(html: string): string {
  // Remove comments
  html = html.replace(/<!--[\s\S]*?-->/g, '')
  
  // Remove extra whitespace
  html = html.replace(/\s+/g, ' ')
  
  // Remove empty attributes
  html = html.replace(/\s+=\s*""/g, '')
  
  return html.trim()
}

function optimizeCss(css: string): string {
  // Remove comments
  css = css.replace(/\/\*[\s\S]*?\*\//g, '')
  
  // Remove extra whitespace
  css = css.replace(/\s+/g, ' ')
  
  // Remove empty rules
  css = css.replace(/\{[^}]*\}/g, (match) => {
    if (match.trim() === '{}') return ''
    return match
  })
  
  return css.trim()
}

function optimizeJs(js: string): string {
  // Remove comments
  js = js.replace(/\/\*[\s\S]*?\*\//g, '')
  js = js.replace(/\/\/.*$/gm, '')
  
  // Remove extra whitespace
  js = js.replace(/\s+/g, ' ')
  
  return js.trim()
} 