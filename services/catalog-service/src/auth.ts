import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { UserRole } from '@grocery-delivery/shared'
import { config } from './config'

interface TokenPayload {
  userId: number | null
  role: UserRole
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Требуется авторизация' })
    return
  }

  try {
    const token = header.slice(7)
    const payload = jwt.verify(token, config.jwtSecret) as TokenPayload
    req.userId = payload.userId
    req.userRole = payload.role

    if (payload.role !== 'admin') {
      res.status(403).json({ message: 'Недостаточно прав' })
      return
    }

    next()
  } catch {
    res.status(401).json({ message: 'Недействительный токен' })
  }
}
