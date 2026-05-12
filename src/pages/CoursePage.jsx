import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { apiFetch } from '../lib/api.js'

export function CoursePage() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [author, setAuthor] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const data = await apiFetch(`/courses/${courseId}`)
        if (cancelled) return
        setCourse(data.course)
        setAuthor(null)
      } catch (e) {
        // If not public (e.g. pending), try author endpoint
        if (isAuthenticated) {
          try {
            const data = await apiFetch(`/my/courses/${courseId}`)
            if (cancelled) return
            setCourse(data.course)
            setAuthor({ name: user?.name || 'Вы' })
          } catch {
            if (cancelled) return
            setCourse(null)
          }
        } else {
          if (cancelled) return
          setCourse(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [courseId, isAuthenticated, user?.name])

  if (!loading && !course) {
    return (
      <Stack spacing={2}>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>
          Курс не найден
        </Typography>
        <Typography color="text.secondary">
          Возможно, он был удалён или ссылка неверная.
        </Typography>
        <Typography component={RouterLink} to="/catalog" style={{ textDecoration: 'none' }}>
          ← Вернуться в каталог
        </Typography>
      </Stack>
    )
  }

  if (loading || !course) {
    return (
      <Stack spacing={2}>
        <Typography color="text.secondary">Загрузка…</Typography>
      </Stack>
    )
  }

  const canEdit = isAuthenticated && user?.id && course.authorId === user.id

  return (
    <Stack spacing={2.5}>
      <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}` }}>
        <CardContent>
          <Stack spacing={1.25}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={course.category} />
              {author?.name && <Chip label={`Автор: ${author.name}`} variant="outlined" />}
              <Chip
                label={
                  course.status === 'APPROVED'
                    ? 'На сайте'
                    : course.status === 'REJECTED'
                      ? 'Отклонён'
                      : 'На модерации'
                }
                variant="outlined"
                color={
                  course.status === 'APPROVED'
                    ? 'success'
                    : course.status === 'REJECTED'
                      ? 'error'
                      : 'warning'
                }
              />
            </Box>

            {course.coverImage ? (
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 420,
                  height: { xs: 180, sm: 210 },
                  borderRadius: 2,
                  border: (t) => `1px solid ${t.palette.divider}`,
                  overflow: 'hidden',
                  bgcolor: 'background.default',
                }}
              >
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
              </Box>
            ) : null}

            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
              {course.title}
            </Typography>
            <Typography color="text.secondary">{course.description || 'Без описания'}</Typography>

            <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
              <Button
                component={RouterLink}
                to={`/courses/${course.id}/learn`}
                variant="contained"
                startIcon={<PlayArrowRoundedIcon />}
                disabled={!Array.isArray(course.stages) || course.stages.length === 0}
              >
                Пройти курс
              </Button>
              <Button
                variant="outlined"
                startIcon={<ArrowBackRoundedIcon />}
                onClick={() => navigate(-1)}
              >
                Назад
              </Button>
              {canEdit && (
                <Button
                  component={RouterLink}
                  to={`/courses/${course.id}/edit`}
                  variant="outlined"
                  startIcon={<EditRoundedIcon />}
                >
                  Редактировать
                </Button>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}

