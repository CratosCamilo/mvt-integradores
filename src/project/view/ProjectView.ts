import { Request, Response } from 'express'
import ProjectModel from '../model/ProjectModel'

export default class ProjectView {
  constructor(private readonly model: ProjectModel) { }

  list(req: Request, res: Response) {
    const q = (req.query.q || '').toString().trim()
    const page = parseInt((req.query.page || '1') as string, 10) || 1
    const pageSize = 6 // 3x3

    const base = q ? this.model.search(q) : this.model.getAll()
    const ordered = this.model.sortByFechaDesc(base)
    const { items, totalPages, total, page: safePage } = this.model.paginate(ordered, page, pageSize)

    res.render('projects', {
      projects: items,
      q,
      page: safePage,
      totalPages,
      total
    })
  }

  detail(req: Request, res: Response) {
    const id = Number(req.params.id)
    const project = this.model.getById(id)

    if (!project) {
      res.status(404)      
      return res.render('error', {
        title: 'Ups…',
        message: 'Proyecto no encontrado'
      })
    }

    res.render('project-detail', { project })
  }
}
