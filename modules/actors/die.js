import * as THREE from "three";
import { TextRenderer } from "../lib/text-renderer.js";
import { delayAndAWait } from "../utils/utils.js";

export class Die {
  constructor(controller, player) {
    this.controller = controller;
    this.player = player;
    this.textures = [];
    this.textRenderer = new TextRenderer(this.controller);
    this.number = 0;
    this.targetOpacity = 0; //0
    this.markForDeletion = false;
    this._init();
  }

  show() {
    this.targetOpacity = 1;
  }
  hide() {
    this.targetOpacity = 0;
  }

  generateNumberTextures() {
    for (let i = 1; i <= 20; i++) {
      const texture = this.textRenderer.createTextTexture(
        `${i}`,
        new THREE.Vector3(4, 4, 4),
        1024,
        250,
        "jacquard12"
      );
      texture.flipX = true;
      texture.flipY = false; // Flip the texture vertically
      texture.needsUpdate = true; // Ensure the texture is updated
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(-1, -1); // Adjust the repeat if necessary
      texture.rotation = Math.PI; // Rotate the texture by 180 degrees
      texture.colorSpace = THREE.SRGBColorSpace;
      this.textures.push(texture);
    }
  }

  async _init() {
    this.generateNumberTextures();
    this.dieMesh = await this.createCompleteDie();
    this.controller.dieManager.registerDie(this);
  }

  lerpOpacity() {
    if (this.dieParent) {
      this.dieParent.traverse((child) => {
        if (child.material && child.material.opacity !== undefined) {
          const distanceToTargetOpacity = Math.abs(
            child.material.opacity - this.targetOpacity
          );
          if (distanceToTargetOpacity > 0.01) {
            child.material.opacity = THREE.MathUtils.lerp(
              child.material.opacity,
              this.targetOpacity,
              0.1
            );
            child.material.transparent = true;
          }
        }
      });
    } else {
      console.warn("Die parent not initialized yet.");
    }
  }

  async roll() {
    for (let i = 0; i < 20; i++) {
      const num = this.generateNumber();
      await delayAndAWait(() => {
        this.updateNumberText(num);
      }, 50);
    }
    this.number = this.generateNumber();
    this.updateNumbertextWithModifier(this.number);
    return this.number + parseInt(this.player.modifier);
  }

  delete() {
    this.markForDeletion = true

    this.controller.dieManager.unregisterDie(this)

    if (this.dieParent) {
      this.controller.scene.remove(this.dieParent);
      // traverse children to dispose of materials and geometries
      this.dieParent.traverse((child) => {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          }
        }
      });
      this.dieParent = null;
    }
  }

  generateNumber() {
    const randomNumber = parseInt(Math.floor(Math.random() * 20) + 1);
    this.updateNumberText(randomNumber);
    return randomNumber;
  }

  async createCompleteDie() {
    this.dieParent = new THREE.Object3D();

    await this.createDieMesh();
    await this.createNameMesh();
    await this.createNumberMesh(Math.floor(Math.random() * 20) + 1);

    this.dieParent.add(this.dieMesh);
    this.dieParent.add(this.nameMesh);
    this.dieParent.add(this.numberMesh);

    this.nameMesh.position.set(0, 1.8, 0.2);
    this.dieMesh.position.set(0, 0, 0);
    this.numberMesh.position.set(0, 0, -0.1);

    this.dieParent.name = "die-parent";
    this.controller.scene.add(this.dieParent);
  }

  async createNumberMesh(number) {
    const texture = this.textures[number - 1];
    this.numberMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2, 2),

      new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        emissive: new THREE.Color(0x00ffff),
        emissiveIntensity: 1,
        side: THREE.DoubleSide,
      })
    );

    this.numberMesh.rotation.x = -Math.PI;
  }

  async createDieMesh() {
    const texture = await this.controller.loadTexture(
      "assets/models/textures/d20-inverted.png"
    );
    this.dieMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 2.8, 2.8),
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
      })
    );

    this.dieMesh.rotation.x = -Math.PI;
  }

  async createNameMesh() {
    const texture = this.textRenderer.createTextTexture(
      this.player.name,
      new THREE.Vector3(4, 1, 4),
      1024,
      250,
      "jacquard12"
    );

    texture.flipX = true;
    texture.flipY = false; // Flip the texture vertically
    texture.needsUpdate = true; // Ensure the texture is updated
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(-1, -1); // Adjust the repeat if necessary
    texture.rotation = Math.PI; // Rotate the texture by 180 degrees
    texture.colorSpace = THREE.SRGBColorSpace; // Ensure the texture uses sRGB color space

    this.nameMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 1, 4),
      new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
      })
    );

    this.nameMesh.rotation.x = -Math.PI;
  }

  setPosition(position) {
    if (this.dieParent) {
      this.dieParent.position.set(position.x, position.y, position.z);
    } else {
      console.warn("Die parent not initialized yet.");
    }
  }

  updateNumberText(number) {
    if (!this.dieParent) {
      console.warn("Die parent not initialized yet.");
      return;
    }
    this.numberMesh.material.map = this.textures[number - 1];
  }

  updateNumbertextWithModifier(number) {
    const texture = this.textRenderer.createTextTexture(
      `${number}`,
      new THREE.Vector3(4, 4, 4),
      1024,
      250,
      "jacquard12"
    );

    texture.flipX = true;
    texture.flipY = false; // Flip the texture vertically
    texture.needsUpdate = true; // Ensure the texture is updated
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(-1, -1); // Adjust the repeat if necessary
    texture.rotation = Math.PI; // Rotate the texture by 180 degrees
    texture.colorSpace = THREE.SRGBColorSpace;
    this.numberMesh.material.map = texture;

    if (number === 20) {
      this.numberMesh.material.emissive = new THREE.Color(0x00ff00);
    } else if (number === 1) {
      this.numberMesh.material.emissive = new THREE.Color(0xff0000);
    } else {
      this.numberMesh.material.emissive = new THREE.Color(0xffff00);
    }
  }

  update() {
    if (this.dieParent) {
      this.dieParent.lookAt(this.controller.cameraController.camera.position);
      this.dieParent.quaternion.copy(
        this.controller.cameraController.camera.quaternion
      );
      this.lerpOpacity(); // Rotate the die parent for a spinning effect
    } else if (!this.markForDeletion) {
      console.warn("Die parent not initialized yet.");
    }
  }
}
