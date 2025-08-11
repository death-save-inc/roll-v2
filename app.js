import {Controller} from "./modules/controller.js"
import {Config} from "./modules/lib/config.js";

export const app = async () => {
    const config = await Config.load();
    const scene = new Controller()
}

await app()

