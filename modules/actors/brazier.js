import { FireEffect } from "../effects/fire-effect.js";
import * as THREE from "three";
import { Actor } from "./actor.js";

export class Brazier extends Actor {
  constructor(controller, name, order, position, scale) {
    super(controller, name, order);
    this.position = position;
    this.scale = scale;
    this._init();
    this.register();
  }

  async _init() {
    const model = await this.controller.loadModel("assets/models/brazier2.glb");

    model.scene.children[0].material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setRGB(180 / 255, 180 / 255, 180 / 255),
    });

    model.scene.children[1].material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setRGB(150 / 255, 150 / 255, 150 / 255),
    });
    model.scene.children[0].castShadow = true;
    model.scene.children[0].receiveShadow = true;
    model.scene.children[1].castShadow = true;
    model.scene.children[1].receiveShadow = true;

    model.scene.position.fromArray(this.position.toArray());
    model.scene.scale.fromArray(this.scale.toArray());
    this.controller.scene.add(model.scene);

    this.fire = new FireEffect(
      this.controller,
      new THREE.Vector3(this.position.x, this.position.y + 3, this.position.z),
      0.5,
      6,
      400,
      7,
      0.0125
    );
    this.ready = true;

  }

  update() {
    if (!this.ready) return;
    this.fire.update();
  }
}
