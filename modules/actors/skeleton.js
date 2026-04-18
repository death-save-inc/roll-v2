import { Actor } from "./actor.js";
import * as THREE from "three";

export class Skeleton extends Actor {
  constructor(controller, name, order, position, scale) {
    super(controller, name, order);
    this.position = position;
    this.scale = scale;
    this._init();
    this.register();
  }

  async _init() {
    const result = await this.controller.loadModel("assets/models/skeleton.glb");
    const skeletonGlb = result.gltf;
    skeletonGlb.scene.position.fromArray(this.position.toArray());
    skeletonGlb.scene.scale.fromArray(this.scale.toArray());
    skeletonGlb.scene.name = "skeleton";
    this.controller.scene.add(skeletonGlb.scene);
     skeletonGlb.scene.rotateY( Math.PI * 2);

      skeletonGlb.scene.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setRGB(100 / 255, 100 / 255, 100 / 255),
          });
        }
      });
  }

  // animate() {
  //   // play first animation automatically
  //   if (this.controller.animations.length > 0) {
  //     // this.controller.play(this.controller.animations[0].name);
  //   }
  // }

  // update() {
  //   // update the skeleton's animation
  //   this.controller.mixer.update(this.controller.clock.getDelta());
  //   }

  update() {}

}