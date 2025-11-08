import { Request, Response } from 'express'
import ProjectModel from '../../project/model/ProjectModel'

export default class CourseView {
  constructor(private readonly projectModel: ProjectModel) {}

  index(req: Request, res: Response) {
    const materias = this.projectModel.getUniqueMaterias()
    res.render('courses-index', {
      title: 'Cursos / Materias',
      materias
    })
  }

  byMateria(req: Request, res: Response) {
    const materia = decodeURIComponent(String(req.params.materia || ''))
    const docente = (req.query.docente || '').toString().trim() || undefined

    const docentes = this.projectModel.getUniqueDocentesByMateria(materia)
    const projects = this.projectModel.getByMateriaAndDocente(materia, docente)

    res.render('courses-detail', {
      title: `Materia: ${materia}`,
      materia,
      docente,
      docentes,
      projects,
      hasFav: (p: any) => this.projectModel.hasFavoriteForDocente(p, docente)
    })
  }
}
