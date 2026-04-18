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
    let result = await this.controller.loadModel("assets/models/platform.glb");
    const platformGlb = result.gltf;
    platformGlb.scene.position.set(0,1.5,0);
    platformGlb.scene.name = "altarPlatform";
    platformGlb.scene.rotateY(90 * (Math.PI / 180));
    platformGlb.scene.scale.set(3, 3, 3);
    this.controller.scene.add(platformGlb.scene);


    // //create temp ground under altar stretching far
    // const altarGround = new THREE.PlaneGeometry(500, 500);
    // const altarGroundMaterial = await this.createAltarMaterial(); 
    // const altarGroundMesh = new THREE.Mesh(altarGround, altarGroundMaterial);

    // //repeat texture on altar ground often to avoid stretching
    // altarGroundMesh.material.map.repeat.set(1, 1);

    // altarGroundMesh.material.map.wrapS = THREE.RepeatWrapping;
    // altarGroundMesh.material.map.wrapT = THREE.RepeatWrapping;
    // altarGroundMesh.position.set(0, 0, 0);
    // altarGroundMesh.rotation.x = -Math.PI / 2;
    // altarGroundMesh.receiveShadow = true;
    // this.controller.scene.add(altarGroundMesh);

       result = await this.controller.loadModel("assets/models/walls.glb");
      const wall = result.gltf;

      // convertWallToPhysicalMaterial(wall.scene);

      wall.scene.position.set(0, 10, 50);
      wall.scene.rotation.y = Math.PI / 2;
      wall.scene.scale.set(5, 5, 5);

      this.controller.scene.add(wall.scene);

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
function convertWallToPhysicalMaterial(root) {
  root.traverse((child) => {
    if (!child.isMesh || !child.material) return;

    const oldMaterials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    const newMaterials = oldMaterials.map((oldMat) => {
      const physicalMat = new THREE.MeshBasicMaterial({
        map: oldMat.map || null,
        normalMap: oldMat.normalMap || null,
        roughnessMap: oldMat.roughnessMap || null,
        metalnessMap: oldMat.metalnessMap || null,
        aoMap: oldMat.aoMap || null,
        emissiveMap: oldMat.emissiveMap || null,
        alphaMap: oldMat.alphaMap || null,

        color: oldMat.color ? oldMat.color.clone() : new THREE.Color(0xffffff),
        emissive: oldMat.emissive
          ? oldMat.emissive.clone()
          : new THREE.Color(0x000000),

        roughness:
          oldMat.roughness !== undefined ? oldMat.roughness : 0.9,
        metalness:
          oldMat.metalness !== undefined ? oldMat.metalness : 0.0,

        transparent: oldMat.transparent ?? false,
        opacity: oldMat.opacity ?? 1,
        side: oldMat.side ?? THREE.FrontSide,
      });

      // good defaults for stone walls
      physicalMat.metalness = 0.0;
      physicalMat.roughness =
        oldMat.roughness !== undefined ? oldMat.roughness : 0.95;

      // optional physical-only properties
      physicalMat.clearcoat = 0.0;
      physicalMat.clearcoatRoughness = 1.0;
      physicalMat.transmission = 0.0;
      physicalMat.ior = 1.5;

      // make sure color textures are treated correctly
      if (physicalMat.map) {
        physicalMat.map.colorSpace = THREE.SRGBColorSpace;
      }
      if (physicalMat.emissiveMap) {
        physicalMat.emissiveMap.colorSpace = THREE.SRGBColorSpace;
      }

      physicalMat.needsUpdate = true;
      return physicalMat;
    });

    child.material = Array.isArray(child.material)
      ? newMaterials
      : newMaterials[0];

    child.castShadow = true;
    child.receiveShadow = true;
  });
}