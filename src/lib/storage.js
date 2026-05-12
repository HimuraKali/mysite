import { createId } from './ids.js'
import { DEFAULT_CATEGORIES } from './seed.js'

const KEYS = {
  users: 'stepik_like_users_v1',
  session: 'stepik_like_session_v1',
  courses: 'stepik_like_courses_v1',
  categories: 'stepik_like_categories_v1',
}

function migrateCourse(course) {
  if (!course || typeof course !== 'object') return null
  if (course.stages && Array.isArray(course.stages)) return course

  const lessons = Array.isArray(course.lessons) ? course.lessons : []
  const stages = [
    {
      id: createId('stage'),
      title: 'Этап 1',
      blocks: lessons.map((l) => ({
        id: createId('block'),
        type: 'text',
        text: String(l?.title || '').trim(),
      })),
    },
  ]

  const { lessons: _lessons, ...rest } = course
  return { ...rest, stages }
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function ensureSeedData() {
  const categories = readJson(KEYS.categories, null)
  if (!Array.isArray(categories) || categories.length === 0) {
    writeJson(KEYS.categories, DEFAULT_CATEGORIES)
  }

  const courses = readJson(KEYS.courses, null)
  if (!Array.isArray(courses)) {
    writeJson(KEYS.courses, [])
  } else {
    const normalized = courses
      .filter((c) => c && typeof c === 'object')
      .filter((c) => c.authorId !== 'seed')
      .map((c) => migrateCourse(c))
      .filter(Boolean)
    if (JSON.stringify(normalized) !== JSON.stringify(courses)) {
      writeJson(KEYS.courses, normalized)
    }
  }

  const users = readJson(KEYS.users, null)
  if (!Array.isArray(users)) writeJson(KEYS.users, [])
}

export function listCategories() {
  ensureSeedData()
  const categories = readJson(KEYS.categories, DEFAULT_CATEGORIES)
  const unique = Array.from(new Set(categories.map((c) => String(c).trim()))).filter(
    Boolean,
  )
  if (!unique.includes('Другое')) unique.push('Другое')
  return unique
}

export function addCategory(name) {
  ensureSeedData()
  const clean = String(name || '').trim()
  if (!clean) return listCategories()
  const current = listCategories()
  const next = Array.from(new Set([...current, clean]))
  writeJson(KEYS.categories, next)
  return next
}

export function listCourses() {
  ensureSeedData()
  return readJson(KEYS.courses, [])
}

export function getCourse(courseId) {
  return listCourses().find((c) => c.id === courseId) || null
}

export function addCourse({ title, description, category, authorId, lessons }) {
  ensureSeedData()
  const course = {
    id: createId('course'),
    title: String(title || '').trim(),
    description: String(description || '').trim(),
    category: String(category || '').trim(),
    authorId: authorId || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stages: Array.isArray(lessons) ? lessons : [],
  }
  const courses = listCourses()
  const next = [course, ...courses]
  writeJson(KEYS.courses, next)
  return course
}

export function updateCourse(courseId, updater) {
  ensureSeedData()
  const courses = listCourses()
  const idx = courses.findIndex((c) => c.id === courseId)
  if (idx === -1) throw new Error('Курс не найден.')
  const current = courses[idx]
  const nextCourse =
    typeof updater === 'function' ? updater(structuredClone(current)) : updater
  if (!nextCourse || typeof nextCourse !== 'object') {
    throw new Error('Некорректные данные курса.')
  }
  const updated = { ...current, ...nextCourse, updatedAt: new Date().toISOString() }
  const next = [...courses]
  next[idx] = updated
  writeJson(KEYS.courses, next)
  return updated
}

export function listUsers() {
  ensureSeedData()
  return readJson(KEYS.users, [])
}

export function getUserById(userId) {
  return listUsers().find((u) => u.id === userId) || null
}

export function getUserByEmail(email) {
  const clean = String(email || '').trim().toLowerCase()
  return listUsers().find((u) => u.email === clean) || null
}

export function createUser({ name, email, password }) {
  ensureSeedData()
  const cleanEmail = String(email || '').trim().toLowerCase()
  const cleanName = String(name || '').trim()
  const cleanPassword = String(password || '')

  if (!cleanEmail || !cleanPassword || !cleanName) {
    throw new Error('Заполните имя, email и пароль.')
  }
  if (cleanPassword.length < 6) {
    throw new Error('Пароль должен быть минимум 6 символов.')
  }
  if (getUserByEmail(cleanEmail)) {
    throw new Error('Пользователь с таким email уже существует.')
  }

  const user = {
    id: createId('user'),
    name: cleanName,
    email: cleanEmail,
    password: cleanPassword,
    createdAt: new Date().toISOString(),
  }
  const next = [user, ...listUsers()]
  writeJson(KEYS.users, next)
  return user
}

export function createSession(userId) {
  const session = { userId, createdAt: new Date().toISOString() }
  writeJson(KEYS.session, session)
  return session
}

export function getSession() {
  return readJson(KEYS.session, null)
}

export function clearSession() {
  localStorage.removeItem(KEYS.session)
}

export function loginWithEmailPassword({ email, password }) {
  const user = getUserByEmail(email)
  if (!user) throw new Error('Пользователь не найден.')
  if (user.password !== String(password || '')) throw new Error('Неверный пароль.')
  createSession(user.id)
  return user
}

