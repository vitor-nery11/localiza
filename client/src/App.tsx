import { AppRoutes } from './routes/AppRoutes'
import { AuthProvider } from './contexts/AuthContext'
import { TrackingProvider } from './contexts/TrackingContext'

export default function App() {
  return (
    <AuthProvider>
      <TrackingProvider>
        <AppRoutes />
      </TrackingProvider>
    </AuthProvider>
  )
}