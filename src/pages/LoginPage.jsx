import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/catalog'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      Promise.resolve(login({ email, password }))
        .then(() => navigate(from, { replace: true }))
        .catch((err) => setError(err?.message || 'Не удалось войти.'))
    } catch (err) {
      setError(err?.message || 'Не удалось войти.')
    }
  }

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 520, mx: 'auto' }}>
      <Stack spacing={0.75}>
        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
          Вход
        </Typography>
        <Typography color="text.secondary">
          Войдите, чтобы публиковать курсы и управлять контентом.
        </Typography>
      </Stack>

      <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}` }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                autoComplete="email"
              />
              <TextField
                label="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                fullWidth
                autoComplete="current-password"
              />
              <Button type="submit" variant="contained">
                Войти
              </Button>
              <Typography variant="body2" color="text.secondary">
                Нет аккаунта?{' '}
                <Typography
                  component={RouterLink}
                  to="/register"
                  variant="body2"
                  sx={{ fontWeight: 800, textDecoration: 'none' }}
                >
                  Зарегистрироваться
                </Typography>
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  )
}

