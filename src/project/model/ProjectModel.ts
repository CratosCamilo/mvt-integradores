import path from 'node:path'
import fs from 'node:fs'

import { Project, Favorite } from '../types/project'

export default class ProjectModel {
  private readonly projects: Project[]

  constructor(filePath?: string) {
    const p = filePath ?? path.join(process.cwd(), 'database', 'projects.json')
    this.projects = JSON.parse(fs.readFileSync(p, 'utf8'))
  }
  getAll(): Project[] {
    return [...this.projects]
  }

  getById(id: number): Project | undefined {
    return this.projects.find(p => p.id === id)
  }

  getFeatured(): Project | undefined {
    return this.projects.find(p => (p as any).destacado || (p as any).active)
  }

  getLatest(n: number): Project[] {
    return this.sortByFechaDesc(this.projects).slice(0, Math.max(0, n))
  }

  search(q: string): Project[] {
    if (!q) return this.getAll()
    const term = q.toLowerCase().trim()

    return this.projects.filter(p => {
      const enNombre = (p.nombre || '').toLowerCase().includes(term)
      const enFecha = (p.fecha || '').toLowerCase().includes(term)
      const enDocente = (p.docente || '').toLowerCase().includes(term)

      const enMateria = (p.materia || '').toLowerCase().trim() === term

      const enIntegr = (p.integrantes || []).some(n => (n || '').toLowerCase().includes(term))
      return enNombre || enFecha || enDocente || enMateria || enIntegr
    })
  }


  sortByFechaDesc(items: Project[]): Project[] {
    const parse = (s?: string): number => {
      if (!s) return 0
      const parts = s.split(/[\/\-]/).map(x => parseInt(x, 10))
      if (parts.length < 3 || Number.isNaN(parts[0])) return 0
      let d: Date
      if (parts[0] > 12) {           // DD/MM/YYYY
        d = new Date(parts[2], parts[1] - 1, parts[0])
      } else if (parts[1] > 12) {
        d = new Date(parts[2], parts[0] - 1, parts[1])
      } else {
        d = new Date(parts[2], parts[0] - 1, parts[1])
      }
      return d.getTime()
    }
    return [...items].sort((a, b) => (parse(b.fecha) - parse(a.fecha)))
  }

  paginate<T>(items: T[], page: number, pageSize: number) {
    const total = items.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const safePage = Math.min(Math.max(1, page), totalPages)
    const start = (safePage - 1) * pageSize
    const end = start + pageSize
    return {
      items: items.slice(start, end),
      page: safePage,
      total,
      totalPages
    }
  }


  getUniqueMaterias(): string[] {
    return [...new Set(this.projects.map(p => p.materia).filter(Boolean) as string[])].sort()
  }


  getUniqueDocentesByMateria(materia: string): string[] {
    const m = (materia || '').trim()
    return [
      ...new Set(
        this.projects
          .filter(p => (p.materia || '').trim() === m)
          .map(p => p.docente)
          .filter(Boolean) as string[]
      )
    ].sort()
  }

  getByMateria(materia: string): Project[] {
    const m = (materia || '').trim()
    return this.projects.filter(p => (p.materia || '').trim() === m)
  }


  getByMateriaAndDocente(materia: string, docente?: string): Project[] {
    const m = (materia || '').trim()
    const d = (docente || '').trim()
    const items = this.getByMateria(m)
    return d ? items.filter(p => (p.docente || '').trim() === d) : items
  }

  hasFavoriteForDocente(p: Project, docente?: string): boolean {
    const favs = Array.isArray(p.favoritos) ? p.favoritos : []
    if (!favs.length) return false
    if (!docente) return true
    const d = docente.trim()
    return favs.some(f => (f.docente || '').trim() === d)
  }

  getFavoritesOfProject(p: Project): Favorite[] {
    return Array.isArray(p.favoritos) ? p.favoritos : []
  }
}
