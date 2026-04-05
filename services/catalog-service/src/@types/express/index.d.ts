declare namespace Express {
  interface Request {
    userId?: number | null
    userRole?: 'customer' | 'admin'
  }
}
