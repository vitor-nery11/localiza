
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { AppLayout } from '../components/AppLayout'
import { DashboardPage } from '../pages/DashboardPages'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NothingFoundPage'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
