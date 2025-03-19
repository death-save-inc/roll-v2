import * as THREE from "three";
import { Actor } from "../actor.js";
import { Brazier } from "../brazier.js" 

export class Braziers extends Actor {
    constructor(controller, name, order) {
        super(controller, name, order);
        this._init();
        this.register();
    }

  async _init() {
    const model = await this.controller.loadModel("assets/models/v2/braziers.glb");

    model.scene.children.forEach((brazier, index) => {
        const position = brazier.position.clone()
         position.sub(new THREE.Vector3(0, 0.69, 0))
        
        new Brazier(
            this.controller,
            `brazier-index-${index}`,
            1,
            position,
            new THREE.Vector3(0.5, 0.5, 0.5)
        );
    })

    this.ready = true;
  }

  update(){
  }
}
