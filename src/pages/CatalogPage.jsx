import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { apiFetch } from '../lib/api.js'
import { DEFAULT_CATEGORIES } from '../lib/categories.js'

function truncateByChars(value, maxChars) {
  const text = String(value || '').trim()
  if (!text) return ''
  if (text.length <= maxChars) return text
  return `${text.slice(0, maxChars).trimEnd()}...`
}

export function CatalogPage() {
  const categories = DEFAULT_CATEGORIES
  const [activeCategory, setActiveCategory] = useState('Все')
  const [query, setQuery] = useState('')
  const [allCourses, setAllCourses] = useState([])

  async function loadCourses() {
    const data = await apiFetch('/courses')
    setAllCourses(data.courses || [])
  }

  useEffect(() => {
    let cancelled = false
    loadCourses().catch(() => {
      if (!cancelled) setAllCourses([])
    })

    const onFocus = () => loadCourses().catch(() => {})
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)

    return () => {
      cancelled = true
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [])

  const courses = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allCourses
      .filter((c) => (activeCategory === 'Все' ? true : c.category === activeCategory))
      .filter((c) => {
        if (!q) return true
        return (
          String(c.title).toLowerCase().includes(q) ||
          String(c.description).toLowerCase().includes(q) ||
          String(c.category).toLowerCase().includes(q)
        )
      })
  }, [activeCategory, query, allCourses])

  return (
    <Stack spacing={2.5}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
          Каталог курсов
        </Typography>
        <Typography color="text.secondary">
          Выберите тему или воспользуйтесь поиском.
        </Typography>
        <Box>
          <Button variant="outlined" onClick={() => loadCourses().catch(() => {})}>
            Обновить
          </Button>
        </Box>
      </Stack>

      <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}` }}>
        <CardContent>
          <Stack spacing={1.5}>
            <TextField
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по названию, описанию или теме…"
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label="Все"
                clickable
                color={activeCategory === 'Все' ? 'primary' : 'default'}
                onClick={() => setActiveCategory('Все')}
              />
              {categories.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  clickable
                  color={activeCategory === c ? 'primary' : 'default'}
                  onClick={() => setActiveCategory(c)}
                />
              ))}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 1.5,
        }}
      >
        {courses.map((course) => (
          <Card
            key={course.id}
            elevation={0}
            sx={{ border: (t) => `1px solid ${t.palette.divider}` }}
          >
            <CardActionArea component={RouterLink} to={`/courses/${course.id}`}>
              <CardContent>
                <Stack spacing={0.9}>
                  <Box
                    sx={{
                      width: '100%',
                      height: { xs: 118, sm: 104 },
                      borderRadius: 1.5,
                      border: (t) => `1px solid ${t.palette.divider}`,
                      bgcolor: 'background.default',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {course.coverImage ? (
                      <Box
                        component="img"
                        src={course.coverImage}
                        alt={`Обложка курса: ${course.title}`}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          p: 0.5,
                          display: 'block',
                        }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Нет фото
                      </Typography>
                    )}
                  </Box>
                  <Chip label={course.category} size="small" sx={{ width: 'fit-content' }} />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      lineHeight: 1.3,
                      minHeight: 36,
                    }}
                  >
                    {truncateByChars(course.title, 38) || 'Без названия'}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.5,
                      minHeight: 32,
                    }}
                  >
                    {truncateByChars(course.description || 'Без описания', 72)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Этапов: {Array.isArray(course.stages) ? course.stages.length : 0}
                  </Typography>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>

      {courses.length === 0 && (
        <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}` }}>
          <CardContent>
            <Typography sx={{ fontWeight: 800 }}>Ничего не найдено</Typography>
            <Typography color="text.secondary">
              Попробуйте изменить тему или запрос поиска.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Stack>
  )
}

