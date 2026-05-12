import { Stack, Typography } from '@mui/material'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { CourseEditor } from '../components/CourseEditor.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { apiFetch } from '../lib/api.js'

export function EditCoursePage() {
  const { ready, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)

  if (ready && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `/courses/${courseId}/edit` }} />
  }

  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false
    setLoading(true)
    apiFetch(`/my/courses/${courseId}`)
      .then((data) => {
        if (!cancelled) setCourse(data.course)
      })
      .catch(() => {
        if (!cancelled) setCourse(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [courseId, isAuthenticated])

  if (!loading && !course) {
    return <Navigate to="/catalog" replace />
  }

  if (!loading && course?.authorId !== user?.id) {
    return <Navigate to={`/courses/${courseId}`} replace />
  }

  return (
    <Stack spacing={2.5}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
          Редактировать курс
        </Typography>
        <Typography color="text.secondary">
          Вы можете менять этапы и блоки. Изменения сохранятся после нажатия кнопки.
        </Typography>
      </Stack>

      {course ? (
        <CourseEditor
          initialCourse={course}
          submitLabel="Сохранить (на модерацию)"
          onCancel={() => navigate(`/courses/${courseId}`)}
        onSubmit={async ({ title, description, category, coverImage, stages }) => {
            await apiFetch(`/my/courses/${courseId}`, {
              method: 'PUT',
            body: { title, description, category, coverImage, stages },
            })
            navigate(`/courses/${courseId}`)
          }}
        />
      ) : (
        <Typography color="text.secondary">Загрузка…</Typography>
      )}
    </Stack>
  )
}

