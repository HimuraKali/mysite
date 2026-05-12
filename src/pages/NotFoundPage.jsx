import { Button, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <Stack spacing={1.5} sx={{ textAlign: 'center', py: 6 }}>
      <Typography variant="h3" sx={{ fontWeight: 900 }}>
        404
      </Typography>
      <Typography color="text.secondary">Страница не найдена.</Typography>
      <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }}>
        <Button component={RouterLink} to="/" variant="contained">
          На главную
        </Button>
        <Button component={RouterLink} to="/catalog" variant="outlined">
          В каталог
        </Button>
      </Stack>
    </Stack>
  )
}

