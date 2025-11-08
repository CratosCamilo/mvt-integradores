import { Router } from 'express'
import CourseView from '../view/CourseView'

export default class CourseRouter {
  public readonly router: Router
  constructor(private readonly view: CourseView) {
    this.router = Router()
    this.routes()
  }

  private readonly routes = (): void => {
    this.router.get('/', (req, res) => this.view.index(req, res))

    this.router.get('/:materia', (req, res) => this.view.byMateria(req, res))
  }
}
