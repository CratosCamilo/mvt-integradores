import { Router } from 'express'
import CommentModel from '../model/CommentModel'

export default class CommentRouter {
  public readonly router: Router
  constructor (private readonly model: CommentModel) {
    this.router = Router()
    this.routes()
  }

  private readonly routes = (): void => {
    this.router.get('/:projectId', (req, res) => {
      const projectId = parseInt(req.params.projectId, 10)
      if (Number.isNaN(projectId)) return res.status(400).json({ error: 'projectId inválido' })
      const items = this.model.listByProject(projectId)
      res.json({ items })
    })

    this.router.post('/', (req, res) => {
      const { projectId, text, name, icon } = req.body ?? {}
      if (!projectId || !text || !name || !icon) {
        return res.status(400).json({ error: 'Faltan campos' })
      }
      const timeISO = new Date().toISOString()
      const saved = this.model.add({ projectId: Number(projectId), text: String(text), name: String(name), icon: String(icon), timeISO })
      res.status(201).json(saved)
    })
  }
}
