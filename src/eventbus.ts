type Listener = (payload: any) => void

interface SharedEventBus {
  on: (event: string, listener: Listener) => void
  off: (event: string, listener: Listener) => void
  emit: (event: string, payload?: any) => void
}

// Access the EventBus instance exposed by app.js on the window object.
// Both the ThreeJS world and React share the same singleton this way
// without Vite bundling a second copy.
const getBus = (): SharedEventBus | undefined => (window as any).__rfi_eventbus

export const on = (event: string, listener: Listener): void => {
  getBus()?.on(event, listener)
}

export const off = (event: string, listener: Listener): void => {
  getBus()?.off(event, listener)
}

export const emit = (event: string, payload?: any): void => {
  getBus()?.emit(event, payload)
}
