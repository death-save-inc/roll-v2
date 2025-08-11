import { FlyingRunes } from "../actors/flying-runes.js";
import { MagicCircleBase } from "../actors/magic-circle-base.js";
import { MagicSwirles } from "../actors/magic-swirles.js";
import { delayAndAWait } from "../utils/utils.js";
import { EventBus } from "../lib/eventbus.js";

export class SpellVfxPipeline {
  constructor(controller) {
    this.controller = controller;

    this.init();
  }

  init() {
    this.CreateVfxComponents();

    EventBus.on("spell:cast",async () => {
      this.swirles.show()
      await delayAndAWait(()=>this.baseCircle.show(), 100)
      await delayAndAWait(()=>this.runes.show(), 1000)
      EventBus.emit("roll:start", {});
    });

    EventBus.on("roll:complete", async () => {
      this.baseCircle.hide()
      this.runes.hide();
      this.swirles.hide();
    });
  }

  CreateVfxComponents() {
    this.baseCircle = new MagicCircleBase(this.controller);
    this.runes = new FlyingRunes(this.controller);
    this.swirles = new MagicSwirles(this.controller);
  }
}
