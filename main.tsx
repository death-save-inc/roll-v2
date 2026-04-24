import { createRoot } from 'react-dom/client'

import { Controller } from './modules/controller.js'
import { Config } from './modules/lib/config.js'
import { EventBus } from './modules/lib/eventbus.js'
import { LocalStorageManager } from './modules/lib/manage-local-storage.js'
import { App } from './src/App.js'
// Expose the EventBus singleton on window so the React layer (src/eventbus.ts)
// can share the same instance without Vite bundling a second copy.

;(window as any).__rfi_eventbus = EventBus

export const initScene = async () => {
  const config = await Config.load()
  const localStorageManager = LocalStorageManager.getInstance()
  const scene = new Controller()
}

await initScene()

createRoot(document.getElementById('root')!).render(<App />)
