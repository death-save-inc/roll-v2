import { StrictMode, useCallback } from "react";
import { PlayerProvider, usePlayerStore } from "./store/playerStore";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useKeyBindings } from "./hooks/useKeyBindings";
import { useEventBridge } from "./hooks/useEventBridge";
import { emit } from "./eventbus";
import { Navigation } from "./components/Navigation";
import { Modal } from "./components/Modal";
import { PlayerSetup } from "./components/PlayerSetup";

function AppContent() {
  const { state, setResults, hydrate, closeModal } = usePlayerStore();

  // Persist & hydrate localStorage
  useLocalStorage(state, hydrate);

  // Bridge React state ↔ ThreeJS EventBus
  useEventBridge({ state, setResults });

  // Keyboard shortcut: R = roll
  const handleRoll = useCallback(() => {
    closeModal();
    emit("spell:cast");
  }, [closeModal]);

  useKeyBindings({ onRoll: handleRoll });

  return (
    <>
      <Modal title="Heroes & Allies" open={state.modalOpen}>
        <PlayerSetup />
      </Modal>
      <Navigation />
    </>
  );
}

export function App() {
  return (
    <StrictMode>
      <PlayerProvider>
        <AppContent />
      </PlayerProvider>
    </StrictMode>
  );
}
