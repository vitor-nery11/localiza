
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { AppLayout } from '../components/AppLayout'
import { ConnectionsPage } from '../pages/ConnectionsPage'
import { DashboardPage } from '../pages/DashboardPages'
import { LocationPage } from '../pages/LocationPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NothingFoundPage'
import { SettingsPage } from '../pages/SettingsPage'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/connections" element={<ConnectionsPage />} />
            <Route path="/localizacao" element={<LocationPage />} />
            <Route path="/location" element={<LocationPage />} />
            <Route path="/configuracoes" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
