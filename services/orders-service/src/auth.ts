import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { config } from './config'

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Требуется авторизация' })
    return
  }

  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret) as { userId: number }
    req.userId = payload.userId
    next()
  } catch {
    res.status(401).json({ message: 'Недействительный токен' })
  }
}
