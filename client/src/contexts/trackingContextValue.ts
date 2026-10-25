import { createContext } from 'react'
import type { Coordinates } from '../services/locationService'

export interface TrackingContextType {
  isTracking: boolean
  currentCoords: Coordinates | null
  lastSentAt: string | null
  sendCount: number
  trackingError: string | null
  startTracking: () => void
  stopTracking: () => void
  toggleTracking: () => void
}

export const TRACKING_STORAGE_KEY = 'finded_live_tracking_enabled'

export const TrackingContext = createContext<TrackingContextType | undefined>(undefined)
