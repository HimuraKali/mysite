import { Button, Card, CardContent, Stack, Typography } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { apiFetch } from '../lib/api.js'
import { CourseViewer } from '../components/CourseViewer.jsx'

export function CourseLearnPage() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const data = await apiFetch(`/courses/${courseId}`)
        if (cancelled) return
        setCourse(data.course)
      } catch {
        if (isAuthenticated) {
          try {
            const data = await apiFetch(`/my/courses/${courseId}`)
            if (cancelled) return
            setCourse(data.course)
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

  useEffect(() => {
    if (!isAuthenticated) return
    if (!course || course.status !== 'APPROVED') return
    apiFetch(`/my/progress/${course.id}/start`, { method: 'POST' }).catch(() => {})
  }, [isAuthenticated, course?.id, course?.status])

  if (!loading && !course) {
    return (
      <Stack spacing={2}>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>
          Курс не найден
        </Typography>
        <Typography color="text.secondary">
          Возможно, курс недоступен или ссылка неверная.
        </Typography>
        <Button component={RouterLink} to="/catalog" variant="outlined">
          Вернуться в каталог
        </Button>
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

  const stages = course?.stages || []

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>
          Обучение: {course.title}
        </Typography>
        <Button variant="outlined" startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(-1)}>
          Назад
        </Button>
      </Stack>

      {stages.length === 0 ? (
        <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}` }}>
          <CardContent>
            <Typography color="text.secondary">В этом курсе пока нет этапов.</Typography>
          </CardContent>
        </Card>
      ) : (
        <CourseViewer
          course={course}
          onNextStage={async (nextIdx) => {
            if (isAuthenticated && course.status === 'APPROVED') {
              const completed = Math.max(progress?.completedStages || 0, nextIdx + 1)
              const payload = {
                currentStageIdx: nextIdx,
                completedStages: Math.min(stages.length, completed),
              }
              try {
                const data = await apiFetch(`/my/progress/${course.id}`, {
                  method: 'PUT',
                  body: payload,
                })
                setProgress(data.progress)
              } catch {
                // ignore
              }
            }
          }}
        />
      )}
    </Stack>
  )
}
