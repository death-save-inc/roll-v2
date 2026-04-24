import { StrictMode, useCallback } from 'react'

import { Modal } from './components/Modal'
import { Navigation } from './components/Navigation'
import { PlayerSetup } from './components/PlayerSetup'
import { emit } from './eventbus'
import { useEventBridge } from './hooks/useEventBridge'
import { useKeyBindings } from './hooks/useKeyBindings'
import { useLocalStorage } from './hooks/useLocalStorage'
import { PlayerProvider, usePlayerStore } from './store/playerStore'

function AppContent() {
  const { state, setResults, hydrate, closeModal } = usePlayerStore()

  // Persist & hydrate localStorage
  useLocalStorage(state, hydrate)

  // Bridge React state ↔ ThreeJS EventBus
  useEventBridge({ state, setResults })

  // Keyboard shortcut: R = roll
  const handleRoll = useCallback(() => {
    closeModal()
    emit('spell:cast')
  }, [closeModal])

  useKeyBindings({ onRoll: handleRoll })

  return (
    <>
      <Navigation />
      <Modal title="Heroes & Allies">
        <PlayerSetup />
      </Modal>
    </>
  )
}

export function App() {
  return (
    <StrictMode>
      <PlayerProvider>
        <AppContent />
      </PlayerProvider>
    </StrictMode>
  )
}

// createRoot(document.getElementById('root')!).render(<App />)
