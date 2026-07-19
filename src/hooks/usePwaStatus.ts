import { useEffect, useRef, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'

export function usePwaStatus() {
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false)
  const [needRefresh, setNeedRefresh] = useState(false)
  const [online, setOnline] = useState(navigator.onLine)
  const update = useRef<(reloadPage?: boolean) => Promise<void>>(async () => undefined)

  useEffect(() => {
    const updateSW = registerSW({
      immediate: true,
      onOfflineReady: () => setServiceWorkerReady(true),
      onNeedRefresh: () => setNeedRefresh(true),
      onRegisteredSW: () => navigator.serviceWorker?.ready.then(() => setServiceWorkerReady(true)),
    })
    update.current = updateSW
    navigator.serviceWorker?.ready.then(() => setServiceWorkerReady(true))
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  return {
    online,
    serviceWorkerReady,
    needRefresh,
    applyUpdate: async () => { await update.current(true) },
    dismissUpdate: () => setNeedRefresh(false),
  }
}
