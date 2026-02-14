import fs from 'fs'
import path from 'path'

export interface Project {
  id: string
  name: string
  code: string
  dependencies: string[]
  createdAt: Date
  updatedAt: Date
  userId?: string
  isPublic?: boolean
  description?: string
  tags?: string[]
}

export interface User {
  id: string
  email: string
  name: string
  projects: string[]
  createdAt: Date
  updatedAt: Date
}

class Database {
  private projectsPath: string
  private usersPath: string

  constructor() {
    this.projectsPath = path.join(process.cwd(), 'data', 'projects')
    this.usersPath = path.join(process.cwd(), 'data', 'users')
    
    // Ensure directories exist
    fs.mkdirSync(this.projectsPath, { recursive: true })
    fs.mkdirSync(this.usersPath, { recursive: true })
  }

  // Project operations
  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const id = this.generateId()
    const now = new Date()
    
    const newProject: Project = {
      ...project,
      id,
      createdAt: now,
      updatedAt: now
    }

    const filePath = path.join(this.projectsPath, `${id}.json`)
    fs.writeFileSync(filePath, JSON.stringify(newProject, null, 2))
    
    return newProject
  }

  async getProject(id: string): Promise<Project | null> {
    try {
      const filePath = path.join(this.projectsPath, `${id}.json`)
      if (!fs.existsSync(filePath)) {
        return null
      }
      
      const data = fs.readFileSync(filePath, 'utf8')
      const project = JSON.parse(data)
      
      // Convert date strings back to Date objects
      project.createdAt = new Date(project.createdAt)
      project.updatedAt = new Date(project.updatedAt)
      
      return project
    } catch (error) {
      console.error('Error reading project:', error)
      return null
    }
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    const project = await this.getProject(id)
    if (!project) {
      return null
    }

    const updatedProject: Project = {
      ...project,
      ...updates,
      updatedAt: new Date()
    }

    const filePath = path.join(this.projectsPath, `${id}.json`)
    fs.writeFileSync(filePath, JSON.stringify(updatedProject, null, 2))
    
    return updatedProject
  }

  async deleteProject(id: string): Promise<boolean> {
    try {
      const filePath = path.join(this.projectsPath, `${id}.json`)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting project:', error)
      return false
    }
  }

  async listProjects(userId?: string, limit: number = 50): Promise<Project[]> {
    try {
      const files = fs.readdirSync(this.projectsPath)
      const projects: Project[] = []

      for (const file of files.slice(0, limit)) {
        if (file.endsWith('.json')) {
          const project = await this.getProject(file.replace('.json', ''))
          if (project) {
            if (userId) {
              if (project.userId === userId || project.isPublic) {
                projects.push(project)
              }
            } else {
              projects.push(project)
            }
          }
        }
      }

      // Sort by updatedAt descending
      return projects.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    } catch (error) {
      console.error('Error listing projects:', error)
      return []
    }
  }

  async searchProjects(query: string, userId?: string): Promise<Project[]> {
    const projects = await this.listProjects(userId)
    
    return projects.filter(project => 
      project.name.toLowerCase().includes(query.toLowerCase()) ||
      project.description?.toLowerCase().includes(query.toLowerCase()) ||
      project.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )
  }

  // User operations
  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = this.generateId()
    const now = new Date()
    
    const newUser: User = {
      ...user,
      id,
      createdAt: now,
      updatedAt: now
    }

    const filePath = path.join(this.usersPath, `${id}.json`)
    fs.writeFileSync(filePath, JSON.stringify(newUser, null, 2))
    
    return newUser
  }

  async getUser(id: string): Promise<User | null> {
    try {
      const filePath = path.join(this.usersPath, `${id}.json`)
      if (!fs.existsSync(filePath)) {
        return null
      }
      
      const data = fs.readFileSync(filePath, 'utf8')
      const user = JSON.parse(data)
      
      // Convert date strings back to Date objects
      user.createdAt = new Date(user.createdAt)
      user.updatedAt = new Date(user.updatedAt)
      
      return user
    } catch (error) {
      console.error('Error reading user:', error)
      return null
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const files = fs.readdirSync(this.usersPath)
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const userId = file.replace('.json', '')
          const user = await this.getUser(userId)
          if (user && user.email === email) {
            return user
          }
        }
      }
      
      return null
    } catch (error) {
      console.error('Error finding user by email:', error)
      return null
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = await this.getUser(id)
    if (!user) {
      return null
    }

    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date()
    }

    const filePath = path.join(this.usersPath, `${id}.json`)
    fs.writeFileSync(filePath, JSON.stringify(updatedUser, null, 2))
    
    return updatedUser
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const filePath = path.join(this.usersPath, `${id}.json`)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting user:', error)
      return false
    }
  }

  // Analytics and statistics
  async getProjectStats(): Promise<{
    totalProjects: number
    totalUsers: number
    recentProjects: Project[]
    popularTags: string[]
  }> {
    const projects = await this.listProjects()
    const users = await this.listUsers()
    
    // Get recent projects (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentProjects = projects.filter(p => p.createdAt > weekAgo)
    
    // Get popular tags
    const tagCounts: Record<string, number> = {}
    projects.forEach(project => {
      project.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })
    
    const popularTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag)
    
    return {
      totalProjects: projects.length,
      totalUsers: users.length,
      recentProjects: recentProjects.slice(0, 10),
      popularTags
    }
  }

  private async listUsers(): Promise<User[]> {
    try {
      const files = fs.readdirSync(this.usersPath)
      const users: User[] = []

      for (const file of files) {
        if (file.endsWith('.json')) {
          const user = await this.getUser(file.replace('.json', ''))
          if (user) {
            users.push(user)
          }
        }
      }

      return users.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    } catch (error) {
      console.error('Error listing users:', error)
      return []
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Backup and restore
  async backup(): Promise<{ projects: Project[], users: User[] }> {
    const projects = await this.listProjects()
    const users = await this.listUsers()
    
    return { projects, users }
  }

  async restore(backup: { projects: Project[], users: User[] }): Promise<void> {
    // Clear existing data
    const projectFiles = fs.readdirSync(this.projectsPath)
    const userFiles = fs.readdirSync(this.usersPath)
    
    projectFiles.forEach(file => {
      if (file.endsWith('.json')) {
        fs.unlinkSync(path.join(this.projectsPath, file))
      }
    })
    
    userFiles.forEach(file => {
      if (file.endsWith('.json')) {
        fs.unlinkSync(path.join(this.usersPath, file))
      }
    })
    
    // Restore projects
    for (const project of backup.projects) {
      const filePath = path.join(this.projectsPath, `${project.id}.json`)
      fs.writeFileSync(filePath, JSON.stringify(project, null, 2))
    }
    
    // Restore users
    for (const user of backup.users) {
      const filePath = path.join(this.usersPath, `${user.id}.json`)
      fs.writeFileSync(filePath, JSON.stringify(user, null, 2))
    }
  }
}

// Export singleton instance
export const db = new Database()
