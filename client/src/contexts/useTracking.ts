import { useContext } from 'react'
import { TrackingContext, type TrackingContextType } from './trackingContextValue'

export function useTracking(): TrackingContextType {
  const context = useContext(TrackingContext)
  if (!context) {
    throw new Error('useTracking deve ser utilizado dentro de um TrackingProvider')
  }
  return context
}
