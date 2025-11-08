import { Router } from 'express'
import HomeView from '../view/HomeView'

export default class HomeRouter {
  public readonly router: Router
  constructor(private readonly view: HomeView) {
    this.router = Router()
    this.routes()
  }

  private readonly routes = (): void => {
    this.router.get('/', (req, res) => this.view.home(req, res))
  }
}
