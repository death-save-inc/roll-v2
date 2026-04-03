import { Controller } from "./modules/controller.js";
import { Config } from "./modules/lib/config.js";
import { LocalStorageManager } from "./modules/lib/manage-local-storage.js";
import { EventBus } from "./modules/lib/eventbus.js";
import "/assets/css/ui.css";

// Expose the EventBus singleton on window so the React layer (src/eventbus.ts)
// can share the same instance without Vite bundling a second copy.
(window as any).__rfi_eventbus = EventBus;

export const app = async () => {
  const config = await Config.load();
  const localStorageManager = LocalStorageManager.getInstance();
  const scene = new Controller();
};

await app();
