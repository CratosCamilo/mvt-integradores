import Server from './server/Server'

import HomeRouter from './home/router/HomeRouter'
import HomeView from './home/view/HomeView'
import ErrorRouter from './error/router/ErrorRouter'
import ErrorView from './error/view/ErrorView'

import ProjectModel from './project/model/ProjectModel'
import ProjectView from './project/view/ProjectView'
import ProjectRouter from './project/router/ProjectRouter'

import CommentRouter from './comment/router/CommentRouter'
import CommentModel from './comment/model/CommentModel'

import CourseRouter from './course/router/CourseRouter'
import CourseView from './course/view/CourseView'

export function buildServer(): Server {
  const projectModel = new ProjectModel()

  const server = new Server(
    new HomeRouter(new HomeView(projectModel)),
    new ProjectRouter(new ProjectView(projectModel)),
    new ErrorRouter(new ErrorView()),
    new CommentRouter(new CommentModel()),
    new CourseRouter(new CourseView(projectModel))
  )

  return server
}

const runningUnderJest =
  !!process.env.JEST_WORKER_ID || process.env.NODE_ENV === 'test'

if (!runningUnderJest) {
  buildServer().start()
}

export default buildServer
