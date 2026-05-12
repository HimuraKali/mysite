import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import { useState } from 'react'
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { SiteFooter } from './SiteFooter.jsx'

export function Layout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const location = useLocation()
  const [accountAnchorEl, setAccountAnchorEl] = useState(null)
  const accountMenuOpen = Boolean(accountAnchorEl)

  return (
    <Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Toolbar>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ flex: 1 }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              component={RouterLink}
              to="/"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <MenuBookRoundedIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                KursHub
              </Typography>
            </Stack>

            <Button
              component={RouterLink}
              to="/catalog"
              color="inherit"
              sx={{ fontWeight: 600 }}
            >
              Каталог
            </Button>

            {isAuthenticated && (
              <Button
                component={RouterLink}
                to="/my-courses"
                color="inherit"
                sx={{ fontWeight: 600 }}
              >
                Мои курсы
              </Button>
            )}

            {isAuthenticated && (
              <Button
                component={RouterLink}
                to="/account"
                color="inherit"
                sx={{ fontWeight: 600 }}
              >
                Кабинет
              </Button>
            )}

            {isAuthenticated && isAdmin && (
              <Button
                component={RouterLink}
                to="/admin"
                color="inherit"
                sx={{ fontWeight: 600 }}
              >
                Админка
              </Button>
            )}
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              component={RouterLink}
              to="/courses/new"
              variant="contained"
              startIcon={<AddRoundedIcon />}
            >
              Добавить курс
            </Button>

            {!isAuthenticated ? (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  color="inherit"
                  sx={{ fontWeight: 600 }}
                  state={{ from: location.pathname }}
                >
                  Вход
                </Button>
                <Button component={RouterLink} to="/register" variant="outlined">
                  Регистрация
                </Button>
              </>
            ) : (
              <>
                <IconButton
                  onClick={(e) => setAccountAnchorEl(e.currentTarget)}
                  size="small"
                  sx={{
                    borderRadius: 2,
                    px: 0.75,
                    py: 0.5,
                    gap: 0.75,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    {String(user?.name || 'U')
                      .trim()
                      .slice(0, 1)
                      .toUpperCase()}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {user?.name}
                  </Typography>
                  <KeyboardArrowDownRoundedIcon sx={{ color: 'text.secondary' }} />
                </IconButton>

                <Menu
                  anchorEl={accountAnchorEl}
                  open={accountMenuOpen}
                  onClose={() => setAccountAnchorEl(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem
                    component={RouterLink}
                    to="/account"
                    onClick={() => setAccountAnchorEl(null)}
                  >
                    Профиль
                  </MenuItem>
                  <MenuItem
                    component={RouterLink}
                    to="/my-courses"
                    onClick={() => setAccountAnchorEl(null)}
                  >
                    Мои курсы
                  </MenuItem>
                  {isAdmin && (
                    <MenuItem
                      component={RouterLink}
                      to="/admin"
                      onClick={() => setAccountAnchorEl(null)}
                    >
                      Админка
                    </MenuItem>
                  )}
                  <MenuItem
                    onClick={() => {
                      setAccountAnchorEl(null)
                      logout()
                    }}
                  >
                    Выйти
                  </MenuItem>
                </Menu>
              </>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flex: 1, py: 3 }}>
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>

      <SiteFooter />
    </Box>
  )
}

