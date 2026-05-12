import {
  Box,
  Container,
  Divider,
  Grid,
  Link,
  Stack,
  Typography,
} from '@mui/material'
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

const linkSx = {
  color: 'common.white',
  textDecoration: 'none',
  fontSize: '0.875rem',
  '&:hover': { color: 'primary.light' },
}

export function SiteFooter() {
  const { isAuthenticated, isAdmin } = useAuth()
  const year = new Date().getFullYear()

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        pt: { xs: 4, md: 6 },
        pb: 3,
        bgcolor: 'grey.900',
        color: 'grey.300',
        borderTop: (t) => `1px solid ${t.palette.grey[800]}`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              component={RouterLink}
              to="/"
              sx={{ textDecoration: 'none', color: 'grey.100', width: 'fit-content' }}
            >
              <MenuBookRoundedIcon sx={{ color: 'primary.light' }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'common.white' }}>
                KursHub
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ mt: 1.5, maxWidth: 320, lineHeight: 1.7 }}>
              Платформа для авторских курсов: создавайте программы обучения, делитесь знаниями и
              проходите курсы других авторов.
            </Typography>
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'common.white', mb: 1.5 }}>
              Платформа
            </Typography>
            <Stack spacing={1}>
              <Link component={RouterLink} to="/catalog" sx={linkSx}>
                Каталог курсов
              </Link>
              <Link component={RouterLink} to="/courses/new" sx={linkSx}>
                Создать курс
              </Link>
              {isAuthenticated && (
                <Link component={RouterLink} to="/my-courses" sx={linkSx}>
                  Мои курсы
                </Link>
              )}
            </Stack>
          </Grid>

          <Grid item xs={6} sm={4} md={3}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'common.white', mb: 1.5 }}>
              Аккаунт
            </Typography>
            <Stack spacing={1}>
              {!isAuthenticated ? (
                <>
                  <Link component={RouterLink} to="/login" sx={linkSx}>
                    Вход
                  </Link>
                  <Link component={RouterLink} to="/register" sx={linkSx}>
                    Регистрация
                  </Link>
                </>
              ) : (
                <>
                  <Link component={RouterLink} to="/account" sx={linkSx}>
                    Личный кабинет
                  </Link>
                  {isAdmin && (
                    <Link component={RouterLink} to="/admin" sx={linkSx}>
                      Панель модерации
                    </Link>
                  )}
                </>
              )}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'common.white', mb: 1.5 }}>
              Сервис
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'grey.400' }}>
              Вопросы по работе платформы — через форму в личном кабинете или на{' '}
              <Link href="mailto:support@kurshub.local" sx={{ ...linkSx, display: 'inline' }}>
                support@kurshub.local
              </Link>
              .
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'grey.800' }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          <Typography variant="caption" sx={{ color: 'grey.500' }}>
            © {year} KursHub. Все права защищены.
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Link href="#" sx={{ ...linkSx, fontSize: '0.75rem' }}>
              Политика конфиденциальности
            </Link>
            <Link href="#" sx={{ ...linkSx, fontSize: '0.75rem' }}>
              Условия использования
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
