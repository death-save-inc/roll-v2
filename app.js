import {Controller} from "./modules/controller.js"
import {Config} from "./modules/lib/config.js";
import { LocalStorageManager } from "./modules/lib/manage-local-storage.js";

export const app = async () => {
    const config = await Config.load();
    const localStorageManager = LocalStorageManager.getInstance()
    const scene = new Controller()
}

await app()

