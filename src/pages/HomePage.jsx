import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded'
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded'
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

const features = [
  {
    icon: <AutoStoriesRoundedIcon sx={{ fontSize: 36 }} />,
    title: 'Курсы на любую тему',
    text: 'От кода и дизайна до языков и хобби — публикуйте структурированные программы с этапами и блоками.',
  },
  {
    icon: <EditNoteRoundedIcon sx={{ fontSize: 36 }} />,
    title: 'Удобный конструктор',
    text: 'Собирайте материалы по шагам: текст, задания и прогресс обучения в одном месте.',
  },
  {
    icon: <CategoryRoundedIcon sx={{ fontSize: 36 }} />,
    title: 'Категории и поиск',
    text: 'Каталог с фильтрами помогает слушателям быстро находить то, что им интересно.',
  },
  {
    icon: <ShieldRoundedIcon sx={{ fontSize: 36 }} />,
    title: 'Модерация',
    text: 'Курсы проходят проверку перед публикацией — качество контента под контролем.',
  },
]

const steps = [
  { n: '1', title: 'Регистрация', text: 'Создайте аккаунт за минуту.' },
  { n: '2', title: 'Создание курса', text: 'Опишите тему и добавьте этапы.' },
  { n: '3', title: 'Публикация', text: 'После одобрения курс появится в каталоге.' },
]

export function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <Box sx={{ pb: 2 }}>
      {/* Hero — full-bleed относительно контейнера Layout: визуально шире за счёт отрицательных margin */}
      <Box
        sx={{
          mx: { xs: -2, sm: -3 },
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, md: 4 },
          pb: { xs: 5, md: 7 },
          mb: 4,
          borderRadius: { xs: 0, sm: 4 },
          background: (t) =>
            `linear-gradient(145deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 42%, ${t.palette.secondary.dark} 100%)`,
          color: 'common.white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: { xs: 280, md: 420 },
            height: { xs: 280, md: 420 },
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.08)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-15%',
            left: '-5%',
            width: { xs: 200, md: 300 },
            height: { xs: 200, md: 300 },
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.06)',
            pointerEvents: 'none',
          }}
        />
        <Container maxWidth="lg" disableGutters sx={{ position: 'relative' }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                variant="overline"
                sx={{
                  letterSpacing: 2,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.85)',
                  display: 'block',
                  mb: 1,
                }}
              >
                Онлайн-обучение
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  letterSpacing: -1.5,
                  lineHeight: 1.1,
                  fontSize: { xs: '2rem', sm: '2.75rem', md: '3.25rem' },
                }}
              >
                Учитесь и делитесь знаниями на KursHub
              </Typography>
              <Typography
                sx={{
                  mt: 2,
                  maxWidth: 560,
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  lineHeight: 1.7,
                  color: 'rgba(255,255,255,0.9)',
                }}
              >
                Публикуйте авторские курсы, проходите программы других авторов и ведите прогресс в
                личном кабинете — всё в одной платформе.
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ mt: 3, flexWrap: 'wrap' }} useFlexGap>
                <Button
                  component={RouterLink}
                  to="/catalog"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{
                    bgcolor: 'common.white',
                    color: 'primary.main',
                    fontWeight: 700,
                    px: 2.5,
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                >
                  Смотреть каталог
                </Button>
                <Button
                  component={RouterLink}
                  to="/courses/new"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'rgba(255,255,255,0.55)',
                    color: 'common.white',
                    fontWeight: 700,
                    '&:hover': {
                      borderColor: 'common.white',
                      bgcolor: 'rgba(255,255,255,0.08)',
                    },
                  }}
                >
                  Создать курс
                </Button>
                {isAuthenticated && (
                  <Button
                    component={RouterLink}
                    to="/my-courses"
                    variant="text"
                    size="large"
                    sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 700 }}
                  >
                    Мои курсы
                  </Button>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Stack spacing={2}>
                <Card
                  elevation={0}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'common.white',
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                      <GroupsRoundedIcon />
                      <Typography sx={{ fontWeight: 800 }}>Для авторов и слушателей</Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.88)', lineHeight: 1.7 }}>
                      Авторы получают конструктор курсов и модерацию. Слушатели — каталог, прогресс
                      и удобный доступ к материалам.
                    </Typography>
                  </CardContent>
                </Card>
                <Card
                  elevation={0}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.95)',
                    color: 'text.primary',
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <TrendingUpRoundedIcon color="primary" />
                      <Typography sx={{ fontWeight: 800 }}>Рост аудитории</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      Курсы в каталоге видят все пользователи платформы — расширяйте охват без
                      отдельного сайта.
                    </Typography>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Typography
        variant="h4"
        component="h2"
        sx={{ fontWeight: 800, letterSpacing: -0.5, mb: 0.5 }}
      >
        Возможности платформы
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 640 }}>
        Всё необходимое, чтобы запускать и проходить курсы — от идеи до публикации.
      </Typography>

      <Grid container columnSpacing={{ xs: 0, md: 4 }} rowSpacing={0}>
        {features.map((f, i) => (
          <Grid item xs={12} md={6} key={f.title}>
            <Box
              sx={{
                py: 2.25,
                display: 'flex',
                gap: 1.75,
                alignItems: 'flex-start',
                borderBottom: (t) => `1px solid ${t.palette.divider}`,
                ...(i < 2 && {
                  borderTop: (t) => `1px solid ${t.palette.divider}`,
                }),
              }}
            >
              <Box
                sx={{
                  mt: 0.25,
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: 'primary.main',
                  bgcolor: (t) =>
                    t.palette.mode === 'light' ? 'rgba(25,118,210,0.10)' : 'rgba(144,202,249,0.18)',
                  '& svg': { fontSize: 24 },
                }}
              >
                {f.icon}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, mb: 0.5 }}>{f.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                  {f.text}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          mt: 5,
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          bgcolor: (t) => (t.palette.mode === 'light' ? 'grey.50' : 'grey.900'),
          border: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
          Как начать
        </Typography>
        <Grid container spacing={3}>
          {steps.map((s) => (
            <Grid item xs={12} md={4} key={s.n}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    color: 'common.white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {s.n}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800 }}>{s.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.7 }}>
                    {s.text}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Card
        elevation={0}
        sx={{
          mt: 4,
          border: (t) => `1px solid ${t.palette.divider}`,
          background: (t) =>
            `linear-gradient(120deg, ${t.palette.primary.main}12, ${t.palette.secondary.main}10)`,
        }}
      >
        <CardContent
          sx={{
            py: { xs: 3, md: 4 },
            px: { xs: 2.5, md: 4 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Готовы начать?
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5, maxWidth: 480 }}>
              Загляните в каталог или создайте свой первый курс — регистрация займёт пару минут.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ flexShrink: 0 }}>
            <Button component={RouterLink} to="/catalog" variant="contained" size="large">
              Каталог
            </Button>
            {!isAuthenticated && (
              <Button component={RouterLink} to="/register" variant="outlined" size="large">
                Зарегистрироваться
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
