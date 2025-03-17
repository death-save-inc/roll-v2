import * as THREE from "three";
import { Actor } from "../actor.js";

export class Generic extends Actor {
    constructor(controller, name, order) {
        super(controller, name, order);
        this._init();
        this.register();
    }

  async _init() {
    const model = await this.controller.loadModel(`assets/models/v2/${this.name}.glb`);

    model.scene.children[0].material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setRGB(180 / 255, 180 / 255, 180 / 255),
    });

    model.scene.children[0].castShadow = true;
    model.scene.children[0].receiveShadow = true;

    if(this.name === 'altar') {
      console.log(model.scene.children[0].position)
    }

    this.controller.scene.add(model.scene);
    this.ready = true;
  }

  update(){
  }
}
