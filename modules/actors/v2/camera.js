import * as THREE from "three";
import { Actor } from "../actor.js";

export class Camera extends Actor {
    constructor(controller, name, order) {
        super(controller, name, order);
        this._init();
        this.register();
    }

  async _init() {
    const model = await this.controller.loadModel("assets/models/v2/camera.glb");

    this.controller.camera = model.cameras[0]

    this.mixer = new THREE.AnimationMixer(this.controller.camera);    
    this.action = this.mixer.clipAction(model.animations[0]);
    this.action.play();

    this.ready = true;
  }

  update(){
    if (!this.ready) return;
    this.mixer.update(this.controller.delta);
  }
}
