import { Stack, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { CourseEditor } from '../components/CourseEditor.jsx'
import { apiFetch } from '../lib/api.js'
import { DEFAULT_CATEGORIES } from '../lib/categories.js'

export function AddCoursePage() {
  const { ready, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const categories = useMemo(() => DEFAULT_CATEGORIES, [])
  const [saving, setSaving] = useState(false)

  if (ready && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: '/courses/new' }} />
  }

  return (
    <Stack spacing={2.5}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
          Добавить курс
        </Typography>
        <Typography color="text.secondary">
          Соберите курс из этапов и блоков: текст, картинка, видео и практика.
        </Typography>
      </Stack>

      <CourseEditor
        initialCourse={{ category: categories[0] || 'Программирование' }}
        submitLabel={saving ? 'Сохранение…' : 'Отправить на модерацию'}
        onCancel={() => navigate('/catalog')}
        onSubmit={async ({ title, description, category, coverImage, stages }) => {
          setSaving(true)
          try {
            const { course } = await apiFetch('/courses', {
              method: 'POST',
              body: { title, description, category, coverImage, stages },
            })
            navigate(`/courses/${course.id}`)
          } finally {
            setSaving(false)
          }
        }}
      />
    </Stack>
  )
}

