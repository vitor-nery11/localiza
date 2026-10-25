import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from './useAuth'
import {
  watchCurrentPosition,
  getCurrentPosition,
  saveMyLocation,
  type Coordinates,
} from '../services/locationService'
import {
  TrackingContext,
  TRACKING_STORAGE_KEY,
} from './trackingContextValue'

export function TrackingProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()

  // Recupera o estado persistido do localStorage para sobreviver a recarregamentos de página
  const [isTracking, setIsTracking] = useState<boolean>(() => {
    try {
      return localStorage.getItem(TRACKING_STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })

  const [currentCoords, setCurrentCoords] = useState<Coordinates | null>(null)
  const [lastSentAt, setLastSentAt] = useState<string | null>(null)
  const [sendCount, setSendCount] = useState<number>(0)
  const [trackingError, setTrackingError] = useState<string | null>(null)

  const lastSendTimeRef = useRef<number>(0)

  function startTracking() {
    setTrackingError(null)
    setIsTracking(true)
    try {
      localStorage.setItem(TRACKING_STORAGE_KEY, 'true')
    } catch (e) {
      console.warn('Erro ao salvar no localStorage:', e)
    }
  }

  function stopTracking() {
    setIsTracking(false)
    try {
      localStorage.setItem(TRACKING_STORAGE_KEY, 'false')
    } catch (e) {
      console.warn('Erro ao atualizar localStorage:', e)
    }
  }

  function toggleTracking() {
    if (isTracking) {
      stopTracking()
    } else {
      startTracking()
    }
  }

  // Apenas desativa a transmissão se a autenticação já tiver sido carregada e o usuário não existir
  useEffect(() => {
    if (!authLoading && !user && isTracking) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      stopTracking()
    }
  }, [authLoading, user, isTracking])

  // Efeito global de monitoramento do GPS e envio para o banco de dados
  useEffect(() => {
    // Não executa enquanto a sessão ainda estiver sendo recuperada pelo Supabase
    if (!isTracking || authLoading || !user) return

    let isMounted = true

    // Dispara leitura e envio imediatos para atualizar sem esperar o primeiro pulso do watchPosition
    void getCurrentPosition()
      .then(async coords => {
        if (!isMounted) return
        setCurrentCoords(coords)
        try {
          await saveMyLocation(coords)
          if (!isMounted) return
          setLastSentAt(new Date().toLocaleTimeString('pt-BR'))
          setSendCount(prev => prev + 1)
          setTrackingError(null)
          lastSendTimeRef.current = Date.now()
        } catch (err) {
          console.warn('Erro ao sincronizar localização inicial:', err)
        }
      })
      .catch(err => {
        console.warn('Aguardando sinal contínuo do GPS:', err)
      })

    const clearWatch = watchCurrentPosition(
      async coords => {
        if (!isMounted) return
        setCurrentCoords(coords)

        const now = Date.now()
        // Throttle de ~4 segundos para envio frequente e suave ao banco
        if (now - lastSendTimeRef.current >= 4000) {
          lastSendTimeRef.current = now
          try {
            await saveMyLocation(coords)
            if (!isMounted) return
            setLastSentAt(new Date().toLocaleTimeString('pt-BR'))
            setSendCount(prev => prev + 1)
            setTrackingError(null)
          } catch (err) {
            console.error('Erro ao enviar transmissão em tempo real:', err)
            if (!isMounted) return
            setTrackingError(
              err instanceof Error
                ? err.message
                : 'Erro ao transmitir para o servidor.'
            )
          }
        }
      },
      err => {
        console.error('Erro no GPS watchPosition:', err)
        if (!isMounted) return
        setTrackingError(err.message)
      }
    )

    return () => {
      isMounted = false
      clearWatch()
    }
  }, [isTracking, authLoading, user])

  return (
    <TrackingContext.Provider
      value={{
        isTracking,
        currentCoords,
        lastSentAt,
        sendCount,
        trackingError,
        startTracking,
        stopTracking,
        toggleTracking,
      }}
    >
      {children}
    </TrackingContext.Provider>
  )
}
