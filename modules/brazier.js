import { FireEffect } from "../modules/fire-effect.js";
import * as THREE from "three";

export const createBrazier = async (controller, position, scale) => {
  const model = await controller.loadModel("assets/models/brazier2.glb");

  model.scene.children[0].material = new THREE.MeshPhongMaterial({
    color: new THREE.Color().setRGB(255 / 255, 255 / 255, 0 / 255),
  });
  model.scene.children[1].material = new THREE.MeshPhongMaterial({
    color: new THREE.Color().setRGB(138 / 255, 129 / 255, 124 / 255),
  });
  model.scene.children[0].castShadow = true; //default is false
  model.scene.children[0].receiveShadow = true; //default
  model.scene.children[1].castShadow = true; //default is false
  model.scene.children[1].receiveShadow = true; //default

  model.scene.position.fromArray(position.toArray());
  model.scene.scale.fromArray(scale.toArray());
  controller.scene.add(model.scene);

  const fire = FireEffect(controller,new THREE.Vector3(position.x, position.y +3, position.z), THREE)

  return {
    model: model,
    fire: fire
  }
};
