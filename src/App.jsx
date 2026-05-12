import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { Layout } from './components/Layout.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { CatalogPage } from './pages/CatalogPage.jsx'
import { CoursePage } from './pages/CoursePage.jsx'
import { CourseLearnPage } from './pages/CourseLearnPage.jsx'
import { AddCoursePage } from './pages/AddCoursePage.jsx'
import { EditCoursePage } from './pages/EditCoursePage.jsx'
import { MyCoursesPage } from './pages/MyCoursesPage.jsx'
import { AccountPage } from './pages/AccountPage.jsx'
import { AdminPage } from './pages/AdminPage.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { RegisterPage } from './pages/RegisterPage.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/courses/:courseId" element={<CoursePage />} />
          <Route path="/courses/:courseId/learn" element={<CourseLearnPage />} />
          <Route path="/courses/new" element={<AddCoursePage />} />
          <Route path="/courses/:courseId/edit" element={<EditCoursePage />} />
          <Route path="/my-courses" element={<MyCoursesPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
