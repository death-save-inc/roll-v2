import * as THREE from "three";
import { Actor } from "./actor.js";

export class TreeBillboard extends Actor {
  constructor(controller, name, order, position, scale) {
    super(controller, name, order);
    this.position = position;
    this.scale = scale;
    this.tree = null;
    this._init();
    this.register();
  }

  async _init() {
    const textureLoader = new THREE.TextureLoader();
    const treeTexture = await textureLoader.loadAsync("assets/models/textures/tree.png");

    treeTexture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.SpriteMaterial({
      map: treeTexture,
      transparent: true,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    this.tree = new THREE.Sprite(material);
    this.tree.position.fromArray(this.position.toArray());
    this.tree.scale.fromArray(this.scale.toArray());
    this.tree.castShadow = true;
    this.tree.receiveShadow = true;

    this.controller.scene.add(this.tree);

    this.addEyes()
    this.ready = true;
  }

  addEyes(){
    if (Math.random() > 0.25) return;
    // add eyes behind the tree sprite, using a second sprite with an eye texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load("assets/models/textures/eyes.png", (eyesTexture) => {
      eyesTexture.colorSpace = THREE.SRGBColorSpace;
      const eyesMaterial = new THREE.SpriteMaterial({
        map: eyesTexture,
        transparent: true,
        alphaTest: 0.5,
        side: THREE.DoubleSide,
        depthWrite: false,
         blending: THREE.AdditiveBlending, 
      });

      //eye glow
      const eyesSprite = new THREE.Sprite(eyesMaterial);
      const randomX = Math.random() * 0.2 - 0.1; // Random offset between -0.1 and 0.1
      const randomY = Math.random() * 0.2 - 0.1;
      eyesSprite.position.set(randomX,randomY, 0);
      eyesSprite.scale.set(0.05, 0.05, 1);
      this.tree.add(eyesSprite);
    });
  }

  update() {
    if (!this.ready || !this.tree || !this.controller.camera) return;

    const camera = this.controller.camera;
    const dx = camera.position.x - this.tree.position.x;
    const dz = camera.position.z - this.tree.position.z;

    this.tree.rotation.y = Math.atan2(dx, dz);
  }
}