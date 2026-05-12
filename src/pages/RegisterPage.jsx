import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export function RegisterPage() {
  const { isAuthenticated, register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/catalog" replace />
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      Promise.resolve(register({ name, email, password }))
        .then(() => navigate('/catalog', { replace: true }))
        .catch((err) => setError(err?.message || 'Не удалось зарегистрироваться.'))
    } catch (err) {
      setError(err?.message || 'Не удалось зарегистрироваться.')
    }
  }

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 520, mx: 'auto' }}>
      <Stack spacing={0.75}>
        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
          Регистрация
        </Typography>
        <Typography color="text.secondary">
          Создайте аккаунт — и вы сможете публиковать курсы.
        </Typography>
      </Stack>

      <Card elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}` }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField
                label="Имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
              />
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                autoComplete="email"
              />
              <TextField
                label="Пароль (мин. 6 символов)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                fullWidth
                autoComplete="new-password"
              />
              <Button type="submit" variant="contained">
                Создать аккаунт
              </Button>
              <Typography variant="body2" color="text.secondary">
                Уже есть аккаунт?{' '}
                <Typography
                  component={RouterLink}
                  to="/login"
                  variant="body2"
                  sx={{ fontWeight: 800, textDecoration: 'none' }}
                >
                  Войти
                </Typography>
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  )
}

