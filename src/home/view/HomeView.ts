import { Request, Response } from 'express'
import ProjectModel from '../../project/model/ProjectModel'

export default class HomeView {
  constructor (private readonly projectModel: ProjectModel) {}

  home (req: Request, res: Response) {
    const q = (req.query.q || '').toString().trim()
    const page = parseInt((req.query.page || '1') as string, 10) || 1
    const pageSize = 3

    const featured = this.projectModel.getFeatured()
    const base = q ? this.projectModel.search(q) : this.projectModel.getAll()
    const ordered = this.projectModel.sortByFechaDesc(base)

    const { items, totalPages, total, page: safePage } =
      this.projectModel.paginate(ordered, page, pageSize)

    res.render('home', {
      title: 'Proyectos Integradores',
      subtitle: 'Sección de noticias (MVT)',
      featured,
      projects: items,
      q,
      page: safePage,
      totalPages,
      total
    })
  }
}
