import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { UserRole } from '@grocery-delivery/shared'
import { config } from './config'

interface TokenPayload {
  userId: number | null
  role: UserRole
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Требуется авторизация' })
    return
  }

  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret) as TokenPayload
    req.userId = payload.userId
    req.userRole = payload.role

    if (payload.role !== 'customer' || !Number.isInteger(payload.userId)) {
      res.status(403).json({ message: 'Раздел заказов доступен только пользователям' })
      return
    }

    next()
  } catch {
    res.status(401).json({ message: 'Недействительный токен' })
  }
}
