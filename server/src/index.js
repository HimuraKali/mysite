import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma.js'
import { config } from './config.js'
import { adminRequired, authRequired, signToken } from './auth.js'
import {
  changePasswordSchema,
  createCourseSchema,
  loginSchema,
  progressSchema,
  registerSchema,
  updateCourseSchema,
} from './validators.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json({ limit: '100mb' }))

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../../dist')))

function toSafeUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt }
}

function courseToDto(c) {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    coverImage: c.coverImage || null,
    status: c.status,
    rejectReason: c.rejectReason,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    authorId: c.authorId,
    stages: JSON.parse(c.stagesJson || '[]'),
  }
}

async function ensureAdmin() {
  const email = config.adminEmail.toLowerCase().trim()
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    if (existing.role !== 'ADMIN') {
      await prisma.user.update({ where: { id: existing.id }, data: { role: 'ADMIN' } })
    }
    return
  }
  const passwordHash = await bcrypt.hash(config.adminPassword, 10)
  await prisma.user.create({
    data: { name: 'Admin', email, passwordHash, role: 'ADMIN' },
  })
}

app.get('/api/health', (_req, res) => res.json({ ok: true }))

// Auth
app.post('/api/auth/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'bad_request' })
  const { name, email, password } = parsed.data

  const normalizedEmail = email.toLowerCase().trim()
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existing) return res.status(409).json({ error: 'email_taken' })

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name: name.trim(), email: normalizedEmail, passwordHash, role: 'USER' },
  })
  const token = signToken(user)
  res.json({ token, user: toSafeUser(user) })
})

app.post('/api/auth/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'bad_request' })
  const { email, password } = parsed.data
  const normalizedEmail = email.toLowerCase().trim()

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (!user) return res.status(401).json({ error: 'invalid_credentials' })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' })

  const token = signToken(user)
  res.json({ token, user: toSafeUser(user) })
})

app.get('/api/me', authRequired, async (req, res) => {
  res.json({ user: toSafeUser(req.user) })
})

app.post('/api/me/change-password', authRequired, async (req, res) => {
  const parsed = changePasswordSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'bad_request' })

  const { currentPassword, newPassword } = parsed.data
  const ok = await bcrypt.compare(currentPassword, req.user.passwordHash)
  if (!ok) return res.status(400).json({ error: 'invalid_password' })

  const passwordHash = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({
    where: { id: req.user.id },
    data: { passwordHash },
  })
  res.json({ ok: true })
})

// Courses - public
app.get('/api/courses', async (_req, res) => {
  const courses = await prisma.course.findMany({
    where: { status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ courses: courses.map(courseToDto) })
})

app.get('/api/courses/:id', async (req, res) => {
  const course = await prisma.course.findUnique({ where: { id: req.params.id } })
  if (!course || course.status !== 'APPROVED') return res.status(404).json({ error: 'not_found' })
  res.json({ course: courseToDto(course) })
})

// Courses - author
app.post('/api/courses', authRequired, async (req, res) => {
  const parsed = createCourseSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'bad_request' })
  const { title, description, category, coverImage, stages } = parsed.data

  const course = await prisma.course.create({
    data: {
      title,
      description,
      category,
      coverImage: coverImage || null,
      stagesJson: JSON.stringify(stages),
      status: 'PENDING',
      authorId: req.user.id,
    },
  })
  res.json({ course: courseToDto(course) })
})

app.get('/api/my/courses', authRequired, async (req, res) => {
  const courses = await prisma.course.findMany({
    where: { authorId: req.user.id },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ courses: courses.map(courseToDto) })
})

app.put('/api/my/courses/:id', authRequired, async (req, res) => {
  const parsed = updateCourseSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'bad_request' })

  const course = await prisma.course.findUnique({ where: { id: req.params.id } })
  if (!course) return res.status(404).json({ error: 'not_found' })
  if (course.authorId !== req.user.id) return res.status(403).json({ error: 'forbidden' })

  const { title, description, category, coverImage, stages } = parsed.data
  const updated = await prisma.course.update({
    where: { id: course.id },
    data: {
      title,
      description,
      category,
      coverImage: coverImage || null,
      stagesJson: JSON.stringify(stages),
      status: 'PENDING',
      rejectReason: null,
    },
  })
  res.json({ course: courseToDto(updated) })
})

app.get('/api/my/courses/:id', authRequired, async (req, res) => {
  const course = await prisma.course.findUnique({ where: { id: req.params.id } })
  if (!course) return res.status(404).json({ error: 'not_found' })
  if (course.authorId !== req.user.id) return res.status(403).json({ error: 'forbidden' })
  res.json({ course: courseToDto(course) })
})

// Progress
app.get('/api/my/progress', authRequired, async (req, res) => {
  const rows = await prisma.courseProgress.findMany({
    where: { userId: req.user.id },
    include: { course: true },
    orderBy: { updatedAt: 'desc' },
  })

  res.json({
    progress: rows.map((r) => {
      const stages = JSON.parse(r.course.stagesJson || '[]')
      const total = Array.isArray(stages) ? stages.length : 0
      const percent = total ? Math.min(100, Math.round((r.completedStages / total) * 100)) : 0
      return {
        course: courseToDto(r.course),
        currentStageIdx: r.currentStageIdx,
        completedStages: r.completedStages,
        percent,
        updatedAt: r.updatedAt,
      }
    }),
  })
})

app.post('/api/my/progress/:courseId/start', authRequired, async (req, res) => {
  const course = await prisma.course.findUnique({ where: { id: req.params.courseId } })
  if (!course || course.status !== 'APPROVED') return res.status(404).json({ error: 'not_found' })

  const row = await prisma.courseProgress.upsert({
    where: { userId_courseId: { userId: req.user.id, courseId: course.id } },
    update: {},
    create: { userId: req.user.id, courseId: course.id, currentStageIdx: 0, completedStages: 0 },
  })
  res.json({ progress: row })
})

app.put('/api/my/progress/:courseId', authRequired, async (req, res) => {
  const parsed = progressSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'bad_request' })

  const course = await prisma.course.findUnique({ where: { id: req.params.courseId } })
  if (!course || course.status !== 'APPROVED') return res.status(404).json({ error: 'not_found' })

  const stages = JSON.parse(course.stagesJson || '[]')
  const total = Array.isArray(stages) ? stages.length : 0
  const { currentStageIdx, completedStages } = parsed.data

  const updated = await prisma.courseProgress.upsert({
    where: { userId_courseId: { userId: req.user.id, courseId: course.id } },
    update: {
      currentStageIdx: Math.max(0, Math.min(currentStageIdx, Math.max(0, total - 1))),
      completedStages: Math.max(0, Math.min(completedStages, total)),
    },
    create: {
      userId: req.user.id,
      courseId: course.id,
      currentStageIdx: Math.max(0, Math.min(currentStageIdx, Math.max(0, total - 1))),
      completedStages: Math.max(0, Math.min(completedStages, total)),
    },
  })
  res.json({ progress: updated })
})

// Admin
app.get('/api/admin/courses/pending', authRequired, adminRequired, async (_req, res) => {
  const courses = await prisma.course.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    include: { author: true },
  })
  res.json({
    courses: courses.map((c) => ({
      ...courseToDto(c),
      author: toSafeUser(c.author),
    })),
  })
})

app.get('/api/admin/courses', authRequired, adminRequired, async (_req, res) => {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: true },
  })
  res.json({
    courses: courses.map((c) => ({
      ...courseToDto(c),
      author: toSafeUser(c.author),
    })),
  })
})

app.get('/api/admin/courses/:id', authRequired, adminRequired, async (req, res) => {
  const course = await prisma.course.findUnique({
    where: { id: req.params.id },
    include: { author: true },
  })
  if (!course) return res.status(404).json({ error: 'not_found' })
  res.json({ course: { ...courseToDto(course), author: toSafeUser(course.author) } })
})

app.delete('/api/admin/courses/:id', authRequired, adminRequired, async (req, res) => {
  const course = await prisma.course.findUnique({ where: { id: req.params.id } })
  if (!course) return res.status(404).json({ error: 'not_found' })
  await prisma.course.delete({ where: { id: course.id } })
  res.json({ ok: true })
})

app.post('/api/admin/courses/:id/approve', authRequired, adminRequired, async (req, res) => {
  const course = await prisma.course.findUnique({ where: { id: req.params.id } })
  if (!course) return res.status(404).json({ error: 'not_found' })
  const updated = await prisma.course.update({
    where: { id: course.id },
    data: { status: 'APPROVED', rejectReason: null },
  })
  res.json({ course: courseToDto(updated) })
})

app.post('/api/admin/courses/:id/reject', authRequired, adminRequired, async (req, res) => {
  const course = await prisma.course.findUnique({ where: { id: req.params.id } })
  if (!course) return res.status(404).json({ error: 'not_found' })
  const reason = String(req.body?.reason || '').trim()
  const updated = await prisma.course.update({
    where: { id: course.id },
    data: { status: 'REJECTED', rejectReason: reason || null },
  })
  res.json({ course: courseToDto(updated) })
})

app.get('/api/admin/users', authRequired, adminRequired, async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
  res.json({ users: users.map(toSafeUser) })
})

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.resolve(__dirname, '../../dist', 'index.html'))
  } else {
    res.status(404).json({ error: 'not_found' })
  }
})

async function main() {
  await ensureAdmin()
  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${config.port}`)
  })
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})

