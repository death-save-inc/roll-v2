import * as THREE from "three";
import { Actor } from "./actor.js";
import * as CANNON from "cannon"

export class Wall extends Actor {
  constructor(controller, name, order, position, scale) {
    super(controller, name, order);
    this.position = position;
    this.scale = scale;
    this._init();
    this.register();
  }

  async _init() {
    const model = await this.controller.loadModel("assets/models/background_01.glb");
    model.scene.traverse((mesh) => {
      //Ugly, need to fix later
      mesh.visible = false
      if (mesh.type === "Mesh") {
        if (mesh.name === "doorframe") {
      
          mesh.material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color().setRGB(180 / 255, 180 / 255, 180 / 255),
          });

        } else if (mesh.name === "floor") {
          const planeShape = new CANNON.Plane()
          const planeBody = new CANNON.Body({ mass: 0 })
          planeBody.addShape(planeShape)
          planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
          this.controller.physics.addBody(planeBody)
          mesh.material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color().setRGB(140 / 255, 140 / 255, 140 / 255),
          });
        }
        else {
          mesh.material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color().setRGB(140 / 255, 140 / 255, 140 / 255),
          });
        }
        mesh.layers.set(3)
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    })

    model.scene.position.fromArray(this.position.toArray());
    model.scene.scale.fromArray(this.scale.toArray());
    model.scene.rotateY(90 * (Math.PI / 180))
    this.controller.scene.add(model.scene);
  }
  update() {

  }
}
