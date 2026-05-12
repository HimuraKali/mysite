import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { apiFetch } from '../lib/api.js'
import { CourseViewer } from '../components/CourseViewer.jsx'

export function AdminPage() {
  const { ready, isAuthenticated, isAdmin } = useAuth()
  const [pending, setPending] = useState([])
  const [allCourses, setAllCourses] = useState([])
  const [users, setUsers] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [error, setError] = useState('')

  async function refresh() {
    const [c, all, u] = await Promise.all([
      apiFetch('/admin/courses/pending'),
      apiFetch('/admin/courses'),
      apiFetch('/admin/users'),
    ])
    setPending(c.courses || [])
    setAllCourses(all.courses || [])
    setUsers(u.users || [])
  }

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return
    refresh().catch(() => {})
  }, [isAuthenticated, isAdmin])

  if (ready && !isAuthenticated) return <Navigate to="/login" replace state={{ from: '/admin' }} />
  if (ready && isAuthenticated && !isAdmin) return <Navigate to="/" replace />

  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.75}>
        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
          Админ‑панель
        </Typography>
        <Typography color="text.secondary">
          Здесь приходят все новые/изменённые курсы на модерацию.
        </Typography>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}` }}>
        <CardContent>
          <Typography sx={{ fontWeight: 900, mb: 1.5 }}>Курсы на модерации</Typography>
          <Grid container spacing={2}>
            {pending.map((c) => (
              <Grid key={c.id} item xs={12} md={6}>
                <Card
                  elevation={0}
                  sx={{ border: (t) => `1px solid ${t.palette.divider}` }}
                >
                  <CardContent>
                    <Stack spacing={1}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                        <Chip label={c.category} size="small" />
                        <Chip label="PENDING" size="small" color="warning" />
                        <Chip
                          label={`Автор: ${c.author?.name || c.authorId}`}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>
                        {c.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {c.description || 'Без описания'}
                      </Typography>

                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Button
                          variant="outlined"
                          onClick={async () => {
                            setError('')
                            try {
                              const data = await apiFetch(`/admin/courses/${c.id}`)
                              setSelectedCourse(data.course)
                              setRejectReason('')
                            } catch (e) {
                              setError(e?.message || 'Ошибка')
                            }
                          }}
                        >
                          Просмотреть
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={async () => {
                            setError('')
                            try {
                              await apiFetch(`/admin/courses/${c.id}/approve`, { method: 'POST' })
                              await refresh()
                            } catch (e) {
                              setError(e?.message || 'Ошибка')
                            }
                          }}
                        >
                          Загрузить на сайт
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={async () => {
                            setError('')
                            try {
                              await apiFetch(`/admin/courses/${c.id}/reject`, {
                                method: 'POST',
                                body: { reason: 'Недопустимый контент' },
                              })
                              await refresh()
                            } catch (e) {
                              setError(e?.message || 'Ошибка')
                            }
                          }}
                        >
                          Отклонить
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {pending.length === 0 && (
            <Typography color="text.secondary">Очередь модерации пуста.</Typography>
          )}
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}` }}>
        <CardContent>
          <Typography sx={{ fontWeight: 900, mb: 1.5 }}>Все курсы (можно удалить)</Typography>
          <Grid container spacing={2}>
            {allCourses.map((c) => (
              <Grid key={`all-${c.id}`} item xs={12} md={6}>
                <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}` }}>
                  <CardContent>
                    <Stack spacing={1}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                        <Chip label={c.category} size="small" />
                        <Chip
                          label={c.status}
                          size="small"
                          color={
                            c.status === 'APPROVED'
                              ? 'success'
                              : c.status === 'REJECTED'
                                ? 'error'
                                : 'warning'
                          }
                        />
                        <Chip
                          label={`Автор: ${c.author?.name || c.authorId}`}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>
                        {c.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {c.description || 'Без описания'}
                      </Typography>

                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Button
                          variant="outlined"
                          onClick={async () => {
                            setError('')
                            try {
                              const data = await apiFetch(`/admin/courses/${c.id}`)
                              setSelectedCourse(data.course)
                              setRejectReason('')
                            } catch (e) {
                              setError(e?.message || 'Ошибка')
                            }
                          }}
                        >
                          Просмотреть
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={async () => {
                            const ok = window.confirm(
                              'Удалить курс полностью? Это действие нельзя отменить.',
                            )
                            if (!ok) return
                            setError('')
                            try {
                              await apiFetch(`/admin/courses/${c.id}`, { method: 'DELETE' })
                              if (selectedCourse?.id === c.id) setSelectedCourse(null)
                              await refresh()
                            } catch (e) {
                              setError(e?.message || 'Ошибка')
                            }
                          }}
                        >
                          Удалить курс
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}` }}>
        <CardContent>
          <Typography sx={{ fontWeight: 900, mb: 1.5 }}>Пользователи</Typography>
          <Grid container spacing={2}>
            {users.map((u) => (
              <Grid key={u.id} item xs={12} md={6}>
                <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}` }}>
                  <CardContent>
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                        <Typography sx={{ fontWeight: 900 }}>{u.name}</Typography>
                        <Chip label={u.role} size="small" />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {u.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        id: {u.id}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(selectedCourse)}
        onClose={() => setSelectedCourse(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Просмотр курса</DialogTitle>
        <DialogContent dividers>
          {selectedCourse ? (
            <Stack spacing={2}>
              <Stack spacing={0.5}>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  {selectedCourse.title}
                </Typography>
                <Typography color="text.secondary">
                  {selectedCourse.description || 'Без описания'}
                </Typography>
              </Stack>

              <CourseViewer
                course={selectedCourse}
                showNextButton={false}
                readonlyTests
              />

              <TextField
                label="Причина отклонения (опционально)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                fullWidth
              />
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedCourse(null)}>Закрыть</Button>
          {selectedCourse ? (
            <>
              <Button
                color="error"
                variant="contained"
                onClick={async () => {
                  const ok = window.confirm('Удалить курс полностью? Это действие нельзя отменить.')
                  if (!ok) return
                  setError('')
                  try {
                    await apiFetch(`/admin/courses/${selectedCourse.id}`, { method: 'DELETE' })
                    setSelectedCourse(null)
                    await refresh()
                  } catch (e) {
                    setError(e?.message || 'Ошибка')
                  }
                }}
              >
                Удалить курс
              </Button>
              <Button
                color="error"
                variant="outlined"
                onClick={async () => {
                  setError('')
                  try {
                    await apiFetch(`/admin/courses/${selectedCourse.id}/reject`, {
                      method: 'POST',
                      body: { reason: rejectReason },
                    })
                    setSelectedCourse(null)
                    await refresh()
                  } catch (e) {
                    setError(e?.message || 'Ошибка')
                  }
                }}
              >
                Отклонить
              </Button>
              <Button
                color="success"
                variant="contained"
                onClick={async () => {
                  setError('')
                  try {
                    await apiFetch(`/admin/courses/${selectedCourse.id}/approve`, { method: 'POST' })
                    setSelectedCourse(null)
                    await refresh()
                  } catch (e) {
                    setError(e?.message || 'Ошибка')
                  }
                }}
              >
                Загрузить на сайт
              </Button>
            </>
          ) : null}
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

