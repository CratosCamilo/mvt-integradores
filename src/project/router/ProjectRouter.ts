import { Router } from 'express'
import ProjectView from '../view/ProjectView'

export default class ProjectRouter {
  public readonly router: Router
  constructor (private readonly view: ProjectView) {
    this.router = Router()
    this.routes()
  }

  private readonly routes = (): void => {
    this.router.get('/v1.0/list', (req, res) => this.view.list(req, res))
    this.router.get('/v1.0/:id', (req, res) => this.view.detail(req, res))
  }
}
