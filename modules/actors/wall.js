import * as THREE from "three";
import { Actor } from "./actor.js";

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
    model.scene.traverse((mesh)=>{
        //Ugly, need to fix later
        if (mesh.type==="Mesh"){
            if (mesh.name === "doorframe"){
                mesh.material = new THREE.MeshPhongMaterial({
                    color: new THREE.Color().setRGB(180 / 255, 180 / 255, 180 / 255),
                  });
            }else {
                mesh.material = new THREE.MeshPhongMaterial({
                    color: new THREE.Color().setRGB(0 / 255, 140 / 255, 140 / 255),
                  });
            }
           
              mesh.castShadow = true;
              mesh.receiveShadow = true;
        }
    })
 
    model.scene.position.fromArray(this.position.toArray());
    model.scene.scale.fromArray(this.scale.toArray());
    model.scene.rotateY (90 * (Math.PI/180))
    this.controller.scene.add(model.scene);
  }
  update(){

  }
}
