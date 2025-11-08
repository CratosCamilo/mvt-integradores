import { Request, Response } from 'express'

export default class ErrorView {
  notFound(req: Request, res: Response): void {
    res.status(404).render('error', { message: 'Página no encontrada' })
  }
}
