import * as THREE from "three";
import { Actor } from "./actor.js";
import * as CANNON from "cannon";

export class Wall extends Actor {
  constructor(controller, name, order, position, scale) {
    super(controller, name, order);
    this.position = position;
    this.scale = scale;
    this._init();
    this.register();
  }

  async _init() {
    // await this.createGround()
    this.createAltar()
  }

  // async _init() {
  //   const rockTexture = await this.controller.loadTexture(
  //     "assets/models/textures/ground_stones_02_1k/basecolor.png"
  //   );
  //   const normalMap = await this.controller.loadTexture(
  //    "assets/models/textures/ground_stones_02_1k/normal.png"
  //   );
  //   const aoMap = await this.controller.loadTexture(
  //    "assets/models/textures/ground_stones_02_1k/ao2.png"
  //   );

  //   const heightMap = await this.controller.loadTexture(
  //     "assets/models/textures/ground_stones_02_1k/height.png"
  //   );

  //   for (const tex of [rockTexture, normalMap, aoMap]) {
  //     tex.wrapS = THREE.RepeatWrapping;
  //     tex.wrapT = THREE.RepeatWrapping;
  //     tex.repeat.set(10, 10);
  //   }

  //   const model = await this.controller.loadModel(
  //     "assets/models/background_01.glb"
  //   );
  //   model.scene.traverse(async (mesh) => {
  //     //Ugly, need to fix later
  //     if (mesh.type === "Mesh") {
  //       if (mesh.name === "doorframe") {
  //         mesh.visible = false;

  //         mesh.material = new THREE.MeshPhysicalMaterial({
  //           color: new THREE.Color().setRGB(60 / 255, 60 / 255, 60 / 255),
  //         });
  //       } else if (mesh.name === "floor") {
  //         mesh.material = new THREE.MeshPhysicalMaterial({
  //           map: rockTexture,
  //           normalMap: normalMap,
  //           aoMap: aoMap,
  //           displacementMap: heightMap,
  //           displacementScale: 0.05 ,


  //           // aoMapIntensity: 2,
  //         });
  //       } else {
  //         mesh.visible = false;
  //         mesh.material = new THREE.MeshPhysicalMaterial({
  //           // map: rockTexture,
  //           // normalMap: normalMap,
  //           // aoMap: aoMap,
  //           // aoMapIntensity: 5,
  //         });
  //       }
  //       // mesh.layers.set(3)
  //       mesh.castShadow = true;
  //       mesh.receiveShadow = true;
  //     }
  //   });

  //   model.scene.position.fromArray(this.position.toArray());
  //   model.scene.scale.fromArray(this.scale.toArray());
  //   model.scene.rotateY(90 * (Math.PI / 180));
  //   this.controller.scene.add(model.scene);
  // }

  async createGround(){
    const groundBox = new THREE.BoxGeometry(100,.1, 100);
    const groundMaterial = await this.createGroundMaterial();
    const groundMesh = new THREE.Mesh(groundBox, groundMaterial);
    groundMesh.position.set(0, -0.05, 0);
    groundMesh.receiveShadow = true;
    groundMesh.castShadow = true;
    groundMesh.name = "ground";
    this.controller.scene.add(groundMesh);
    console.log(groundMesh)
  }

  async createGroundMaterial(){
    const rockTexture = await this.controller.loadTexture(
      "assets/models/textures/cliff_rocks_02_1k/basecolor.png"
    );
    const normalMap = await this.controller.loadTexture(
     "assets/models/textures/cliff_rocks_02_1k/normal.png"
    );
    const aoMap = await this.controller.loadTexture(
     "assets/models/textures/cliff_rocks_02_1k/ao2.png"
    );

    const heightMap = await this.controller.loadTexture(
      "assets/models/textures/cliff_rocks_02_1k/height.png"
    );

    for (const tex of [rockTexture, normalMap, aoMap]) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(12, 12);
    }
    return new THREE.MeshPhysicalMaterial({
      map: rockTexture,
      normalMap: normalMap,
      aoMap: aoMap,
      displacementMap: heightMap,
      displacementScale: 0.05 ,
    });
  }

  async createAltarMaterial(){
    const rockTexture = await this.controller.loadTexture(
      "assets/models/textures/ground_stones_02_1k/basecolor.png"
    );
    const normalMap = await this.controller.loadTexture(
     "assets/models/textures/ground_stones_02_1k/normal.png"
    );
    const aoMap = await this.controller.loadTexture(
     "assets/models/textures/ground_stones_02_1k/ao2.png"
    );

    for (const tex of [rockTexture, normalMap, aoMap]) {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, 1);
    }
    return new THREE.MeshPhysicalMaterial({
      map: rockTexture,
      normalMap: normalMap,
      aoMap: aoMap,
      displacementScale: 0.05 ,
    });
  }

  async createAltar(){
    const platformGlb = await this.controller.loadModel("assets/models/platform.glb");
    platformGlb.scene.position.set(0,1.5,0);
    platformGlb.scene.name = "altarPlatform";
    platformGlb.scene.rotateY(90 * (Math.PI / 180));
    platformGlb.scene.scale.set(3, 3, 3);
    this.controller.scene.add(platformGlb.scene);
    // const altarCylinder = new THREE.CylinderGeometry(5, 7, 1, 32);
    // const altarMaterial = await  this.createAltarMaterial();
    // const altarMesh = new THREE.Mesh(altarCylinder, altarMaterial);
    // altarMesh.position.set(0, 0, 0);
    // altarMesh.receiveShadow = true;
    // altarMesh.castShadow = true;
    // altarMesh.name = "altar";
    // this.controller.scene.add(altarMesh);
  }

  update() {}
}
