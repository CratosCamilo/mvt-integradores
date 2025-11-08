import express, { Application } from 'express'
import path from 'node:path'

import HomeRouter from '../home/router/HomeRouter'
import ErrorRouter from '../error/router/ErrorRouter'
import ProjectRouter from '../project/router/ProjectRouter'
import CommentRouter from '../comment/router/CommentRouter'
import CourseRouter from '../course/router/CourseRouter'

export default class Server {
  private readonly app: Application

  constructor(
    private readonly homeRouter: HomeRouter,
    private readonly projectRouter: ProjectRouter,
    private readonly errorRouter: ErrorRouter,
    private readonly commentRouter: CommentRouter,
    private readonly courseRouter: CourseRouter
  ) {
    this.app = express()
    this.configure()
    this.static()
    this.routes()
  }

  public get express(): Application {
    return this.app
  }

  private configure(): void {
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
    this.app.set('view engine', 'ejs')
    this.app.set('views', path.join(__dirname, '../template'))
  }

  private static(): void {
    this.app.use(express.static(path.join(__dirname, '../public')))
  }

  private routes(): void {
    this.app.use('/', this.homeRouter.router)
    this.app.use('/projects', this.projectRouter.router)
    this.app.use('/courses', this.courseRouter.router)

    this.app.use('/comments', this.commentRouter.router)

    this.app.use('*', this.errorRouter.router)
  }

  public start(): void {
    const port = 1888
    const host = 'localhost'
    this.app.listen(port, () => {
      console.log(`Server is running on http://${host}:${port}`)
    })
  }
}
