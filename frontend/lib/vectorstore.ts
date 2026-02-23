import fs from 'fs'
import path from 'path'

export interface CodeSnippet {
  id: string
  title: string
  code: string
  description: string
  tags: string[]
  language: string
  embedding: number[]
  createdAt: Date
}

export interface SearchResult {
  snippet: CodeSnippet
  score: number
}

class VectorStore {
  private dataPath: string
  private snippets: CodeSnippet[] = []

  constructor() {
    this.dataPath = path.join(process.cwd(), 'data', 'vectorstore')
    fs.mkdirSync(this.dataPath, { recursive: true })
    this.loadSnippets()
  }

  private loadSnippets() {
    try {
      const filePath = path.join(this.dataPath, 'snippets.json')
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8')
        const parsed = JSON.parse(data)
        this.snippets = parsed.map((snippet: any) => ({
          ...snippet,
          createdAt: new Date(snippet.createdAt)
        }))
      }
    } catch (error) {
      console.error('Error loading snippets:', error)
      this.snippets = []
    }
  }

  private saveSnippets() {
    try {
      const filePath = path.join(this.dataPath, 'snippets.json')
      fs.writeFileSync(filePath, JSON.stringify(this.snippets, null, 2))
    } catch (error) {
      console.error('Error saving snippets:', error)
    }
  }

  // Simple embedding function (in production, use a real embedding model)
  private async generateEmbedding(text: string): Promise<number[]> {
    // This is a simple hash-based embedding for demo purposes
    // In production, use OpenAI embeddings or similar
    const hash = this.simpleHash(text)
    const embedding = new Array(1536).fill(0)
    
    for (let i = 0; i < Math.min(hash.length, embedding.length); i++) {
      embedding[i] = (hash.charCodeAt(i) - 128) / 128
    }
    
    return embedding
  }

  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString()
  }

  // Cosine similarity between two vectors
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }
    
    if (normA === 0 || normB === 0) return 0
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  async addSnippet(snippet: Omit<CodeSnippet, 'id' | 'embedding' | 'createdAt'>): Promise<CodeSnippet> {
    const id = this.generateId()
    const embedding = await this.generateEmbedding(snippet.code + ' ' + snippet.description)
    const now = new Date()

    const newSnippet: CodeSnippet = {
      ...snippet,
      id,
      embedding,
      createdAt: now
    }

    this.snippets.push(newSnippet)
    this.saveSnippets()

    return newSnippet
  }

  async search(query: string, limit: number = 5): Promise<SearchResult[]> {
    const queryEmbedding = await this.generateEmbedding(query)
    
    const results: SearchResult[] = this.snippets.map(snippet => ({
      snippet,
      score: this.cosineSimilarity(queryEmbedding, snippet.embedding)
    }))

    // Sort by score descending and return top results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .filter(result => result.score > 0.1) // Filter out low similarity results
  }

  async searchByTags(tags: string[], limit: number = 5): Promise<SearchResult[]> {
    const results: SearchResult[] = this.snippets
      .filter(snippet => 
        snippet.tags.some(tag => 
          tags.some(searchTag => 
            tag.toLowerCase().includes(searchTag.toLowerCase())
          )
        )
      )
      .map(snippet => ({
        snippet,
        score: snippet.tags.filter(tag => 
          tags.some(searchTag => 
            tag.toLowerCase().includes(searchTag.toLowerCase())
          )
        ).length / tags.length
      }))

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  async searchByLanguage(language: string, limit: number = 5): Promise<SearchResult[]> {
    const results: SearchResult[] = this.snippets
      .filter(snippet => snippet.language.toLowerCase() === language.toLowerCase())
      .map(snippet => ({
        snippet,
        score: 1.0
      }))

    return results.slice(0, limit)
  }

  async getSnippet(id: string): Promise<CodeSnippet | null> {
    return this.snippets.find(snippet => snippet.id === id) || null
  }

  async updateSnippet(id: string, updates: Partial<CodeSnippet>): Promise<CodeSnippet | null> {
    const index = this.snippets.findIndex(snippet => snippet.id === id)
    if (index === -1) return null

    const updatedSnippet = { ...this.snippets[index], ...updates }
    
    // Regenerate embedding if code or description changed
    if (updates.code || updates.description) {
      updatedSnippet.embedding = await this.generateEmbedding(
        (updates.code || this.snippets[index].code) + ' ' + 
        (updates.description || this.snippets[index].description)
      )
    }

    this.snippets[index] = updatedSnippet
    this.saveSnippets()

    return updatedSnippet
  }

  async deleteSnippet(id: string): Promise<boolean> {
    const index = this.snippets.findIndex(snippet => snippet.id === id)
    if (index === -1) return false

    this.snippets.splice(index, 1)
    this.saveSnippets()

    return true
  }

  async getStats(): Promise<{
    totalSnippets: number
    languages: Record<string, number>
    tags: Record<string, number>
    recentSnippets: CodeSnippet[]
  }> {
    const languages: Record<string, number> = {}
    const tags: Record<string, number> = {}

    this.snippets.forEach(snippet => {
      languages[snippet.language] = (languages[snippet.language] || 0) + 1
      snippet.tags.forEach(tag => {
        tags[tag] = (tags[tag] || 0) + 1
      })
    })

    const recentSnippets = this.snippets
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10)

    return {
      totalSnippets: this.snippets.length,
      languages,
      tags,
      recentSnippets
    }
  }

  // Initialize with some common React patterns
  async initializeWithCommonPatterns(): Promise<void> {
    if (this.snippets.length > 0) return // Already initialized

    const commonPatterns = [
      {
        title: 'React Functional Component',
        code: `export default function MyComponent() {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  )
}`,
        description: 'Basic React functional component structure',
        tags: ['react', 'component', 'functional'],
        language: 'javascript'
      },
      {
        title: 'useState Hook',
        code: `const [state, setState] = useState(initialValue)`,
        description: 'React useState hook for state management',
        tags: ['react', 'hooks', 'state'],
        language: 'javascript'
      },
      {
        title: 'useEffect Hook',
        code: `useEffect(() => {
  // Effect code here
  return () => {
    // Cleanup code here
  }
}, [dependencies])`,
        description: 'React useEffect hook for side effects',
        tags: ['react', 'hooks', 'effects'],
        language: 'javascript'
      },
      {
        title: 'Form Handling',
        code: `const handleSubmit = (e) => {
  e.preventDefault()
  // Handle form submission
}`,
        description: 'Form submission handler with preventDefault',
        tags: ['react', 'forms', 'events'],
        language: 'javascript'
      },
      {
        title: 'Conditional Rendering',
        code: `{isVisible && <div>Content</div>}`,
        description: 'Conditional rendering in React',
        tags: ['react', 'conditional', 'rendering'],
        language: 'javascript'
      },
      {
        title: 'List Rendering',
        code: `{items.map((item, index) => (
  <div key={item.id}>{item.name}</div>
))}`,
        description: 'Rendering lists in React with keys',
        tags: ['react', 'lists', 'mapping'],
        language: 'javascript'
      },
      {
        title: 'Event Handler',
        code: `const handleClick = () => {
  // Handle click event
}`,
        description: 'Event handler function',
        tags: ['react', 'events', 'handlers'],
        language: 'javascript'
      },
      {
        title: 'Props Destructuring',
        code: `function MyComponent({ prop1, prop2 }) {
  return <div>{prop1} {prop2}</div>
}`,
        description: 'Destructuring props in React components',
        tags: ['react', 'props', 'destructuring'],
        language: 'javascript'
      },
      {
        title: 'Tailwind CSS Classes',
        code: `className="flex items-center justify-center bg-blue-500 text-white p-4 rounded-lg"`,
        description: 'Common Tailwind CSS utility classes',
        tags: ['tailwind', 'css', 'styling'],
        language: 'css'
      },
      {
        title: 'Async Function',
        code: `const fetchData = async () => {
  try {
    const response = await fetch('/api/data')
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error:', error)
  }
}`,
        description: 'Async function with error handling',
        tags: ['javascript', 'async', 'fetch'],
        language: 'javascript'
      }
    ]

    for (const pattern of commonPatterns) {
      await this.addSnippet(pattern)
    }

    console.log('Vector store initialized with common patterns')
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}

// Export singleton instance
export const vectorStore = new VectorStore()

// Initialize with common patterns
vectorStore.initializeWithCommonPatterns().catch(console.error) 