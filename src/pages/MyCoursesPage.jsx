import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { Link as RouterLink, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { apiFetch } from '../lib/api.js'

function truncateByChars(value, maxChars) {
  const text = String(value || '').trim()
  if (!text) return ''
  if (text.length <= maxChars) return text
  return `${text.slice(0, maxChars).trimEnd()}...`
}

export function MyCoursesPage() {
  const { ready, isAuthenticated, user } = useAuth()
  const [authoredCourses, setAuthoredCourses] = useState([])
  const [learningProgress, setLearningProgress] = useState([])

  if (ready && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: '/my-courses' }} />
  }

  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false
    Promise.all([apiFetch('/my/courses'), apiFetch('/my/progress')])
      .then(([coursesData, progressData]) => {
        if (cancelled) return
        setAuthoredCourses(coursesData.courses || [])
        setLearningProgress(progressData.progress || [])
      })
      .catch(() => {
        if (cancelled) return
        setAuthoredCourses([])
        setLearningProgress([])
      })
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.75}>
        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
          Мои курсы
        </Typography>
        <Typography color="text.secondary">
          Здесь отображаются курсы, которые вы проходите и которые вы создали.
        </Typography>
      </Stack>

      <Typography variant="h6" sx={{ fontWeight: 800 }}>
        Прохожу
      </Typography>
      <Box
        sx={{
          width: '100%',
          maxWidth: 560,
          mx: 'auto',
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
          },
          gap: 1.5,
        }}
      >
        {learningProgress.map((entry) => {
          const course = entry.course
          return (
            <Card key={`learning-${course.id}`} elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}` }}>
              <CardActionArea component={RouterLink} to={`/courses/${course.id}/learn`}>
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
                          sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.5, display: 'block' }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">Нет фото</Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      <Chip label={course.category} size="small" sx={{ width: 'fit-content' }} />
                      <Chip label={`${entry.percent || 0}%`} size="small" color="primary" sx={{ width: 'fit-content' }} />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, lineHeight: 1.3, minHeight: 36 }}>
                      {truncateByChars(course.title, 38) || 'Без названия'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5, minHeight: 32 }}>
                      {truncateByChars(course.description || 'Без описания', 72)}
                    </Typography>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          )
        })}
      </Box>
      {learningProgress.length === 0 && (
        <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}` }}>
          <CardContent>
            <Typography sx={{ fontWeight: 900 }}>Пока нет курсов в обучении</Typography>
            <Typography color="text.secondary">Откройте любой курс и нажмите «Пройти курс».</Typography>
          </CardContent>
        </Card>
      )}

      <Typography variant="h6" sx={{ fontWeight: 800 }}>
        Созданные мной
      </Typography>
      <Box
        sx={{
          width: '100%',
          maxWidth: 560,
          mx: 'auto',
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
          },
          gap: 1.5,
        }}
      >
        {authoredCourses.map((course) => (
          <Card key={`authored-${course.id}`} elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}` }}>
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
                        sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.5, display: 'block' }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary">Нет фото</Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    <Chip label={course.category} size="small" sx={{ width: 'fit-content' }} />
                    <Chip
                      label={
                        course.status === 'APPROVED'
                          ? 'На сайте'
                          : course.status === 'REJECTED'
                            ? 'Отклонён'
                            : 'На модерации'
                      }
                      size="small"
                      color={
                        course.status === 'APPROVED'
                          ? 'success'
                          : course.status === 'REJECTED'
                            ? 'error'
                            : 'warning'
                      }
                      sx={{ width: 'fit-content' }}
                    />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, lineHeight: 1.3, minHeight: 36 }}>
                    {truncateByChars(course.title, 38) || 'Без названия'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5, minHeight: 32 }}>
                    {truncateByChars(course.description || 'Без описания', 72)}
                  </Typography>
                  {course.status === 'REJECTED' && course.rejectReason ? (
                    <Typography variant="caption" color="text.secondary">
                      Причина: {truncateByChars(course.rejectReason, 60)}
                    </Typography>
                  ) : null}
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>

      {authoredCourses.length === 0 && (
        <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}` }}>
          <CardContent>
            <Typography sx={{ fontWeight: 900 }}>Пока нет курсов</Typography>
            <Typography color="text.secondary">
              Создайте свой первый курс через кнопку “Добавить курс”.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Stack>
  )
}

