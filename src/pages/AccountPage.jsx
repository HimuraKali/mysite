import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { Link as RouterLink, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { apiFetch } from '../lib/api.js'

export function AccountPage() {
  const { ready, isAuthenticated, user } = useAuth()
  const [myCourses, setMyCourses] = useState([])
  const [myProgress, setMyProgress] = useState([])
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false
    Promise.all([apiFetch('/my/courses'), apiFetch('/my/progress')])
      .then(([coursesData, progressData]) => {
        if (cancelled) return
        setMyCourses(coursesData.courses || [])
        setMyProgress(progressData.progress || [])
      })
      .catch(() => {
        if (cancelled) return
        setMyCourses([])
        setMyProgress([])
      })
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  if (ready && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: '/account' }} />
  }

  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.75}>
        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
          Личный кабинет
        </Typography>
        <Typography color="text.secondary">
          {user?.name} · {user?.email}
        </Typography>
      </Stack>

      <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}` }}>
        <CardContent>
          <Stack
            component="form"
            spacing={1.25}
            onSubmit={async (e) => {
              e.preventDefault()
              setPasswordError('')
              setPasswordSuccess('')

              if (!currentPassword || !newPassword) {
                setPasswordError('Заполните текущий и новый пароль.')
                return
              }
              if (newPassword.length < 6) {
                setPasswordError('Новый пароль должен быть не короче 6 символов.')
                return
              }
              if (newPassword !== confirmPassword) {
                setPasswordError('Подтверждение пароля не совпадает.')
                return
              }

              try {
                await apiFetch('/me/change-password', {
                  method: 'POST',
                  body: { currentPassword, newPassword },
                })
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
                setPasswordSuccess('Пароль успешно изменён.')
              } catch (err) {
                setPasswordError(
                  err?.message === 'invalid_password'
                    ? 'Текущий пароль введён неверно.'
                    : err?.message || 'Не удалось изменить пароль.',
                )
              }
            }}
          >
            <Typography sx={{ fontWeight: 900 }}>Сменить пароль</Typography>
            <TextField
              type="password"
              label="Текущий пароль"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              fullWidth
            />
            <TextField
              type="password"
              label="Новый пароль"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
            />
            <TextField
              type="password"
              label="Повторите новый пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
            />
            {passwordError && <Alert severity="error">{passwordError}</Alert>}
            {passwordSuccess && <Alert severity="success">{passwordSuccess}</Alert>}
            <Box>
              <Button type="submit" variant="contained">
                Изменить пароль
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}` }}>
        <CardContent>
          <Typography sx={{ fontWeight: 900, mb: 1.5 }}>Курсы, которые вы проходите</Typography>
          <Grid container spacing={2}>
            {myProgress.map((p) => (
              <Grid key={p.course.id} item xs={12} md={6}>
                <Card
                  elevation={0}
                  sx={{ border: (t) => `1px solid ${t.palette.divider}` }}
                >
                  <CardActionArea component={RouterLink} to={`/courses/${p.course.id}`}>
                    <CardContent>
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Chip label={p.course.category} size="small" />
                          <Typography sx={{ fontWeight: 900 }}>{p.percent}%</Typography>
                        </Stack>
                        <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.25 }}>
                          {p.course.title}
                        </Typography>
                        <LinearProgress variant="determinate" value={p.percent} />
                        <Typography variant="body2" color="text.secondary">
                          Пройдено этапов: {p.completedStages} из{' '}
                          {Array.isArray(p.course.stages) ? p.course.stages.length : 0}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {myProgress.length === 0 && (
            <Typography color="text.secondary">
              Пока нет курсов в процессе. Откройте курс и начните прохождение.
            </Typography>
          )}
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}` }}>
        <CardContent>
          <Typography sx={{ fontWeight: 900, mb: 1.5 }}>Мои созданные курсы</Typography>
          <Grid container spacing={2}>
            {myCourses.map((c) => (
              <Grid key={c.id} item xs={12} sm={6} md={4}>
                <Card
                  elevation={0}
                  sx={{ border: (t) => `1px solid ${t.palette.divider}` }}
                >
                  <CardActionArea component={RouterLink} to={`/courses/${c.id}`}>
                    <CardContent>
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Chip label={c.category} size="small" />
                          <Chip
                            label={
                              c.status === 'APPROVED'
                                ? 'На сайте'
                                : c.status === 'REJECTED'
                                  ? 'Отклонён'
                                  : 'На модерации'
                            }
                            size="small"
                            color={
                              c.status === 'APPROVED'
                                ? 'success'
                                : c.status === 'REJECTED'
                                  ? 'error'
                                  : 'warning'
                            }
                          />
                        </Stack>
                        <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.25 }}>
                          {c.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {c.description || 'Без описания'}
                        </Typography>
                        {c.status === 'REJECTED' && c.rejectReason ? (
                          <Typography variant="body2" color="text.secondary">
                            Причина: {c.rejectReason}
                          </Typography>
                        ) : null}
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {myCourses.length === 0 && (
            <Typography color="text.secondary">
              У вас пока нет созданных курсов. Нажмите “Добавить курс”.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Stack>
  )
}

