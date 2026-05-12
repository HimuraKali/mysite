import jwt from 'jsonwebtoken'
import { config } from './config.js'
import { prisma } from './prisma.js'

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: '7d',
  })
}

export async function authRequired(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'unauthorized' })

  try {
    const payload = jwt.verify(token, config.jwtSecret)
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) return res.status(401).json({ error: 'unauthorized' })
    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'unauthorized' })
  }
}

export function adminRequired(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' })
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'forbidden' })
  next()
}

