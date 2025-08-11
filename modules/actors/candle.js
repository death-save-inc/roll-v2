// Candle.js
import * as THREE from "three";
import { Actor } from "./actor.js";

export class Candle extends Actor {
  /**
   * @param controller  { scene:THREE.Scene,
   *                      registerRenderAction(name,order,fn) }
   * @param position    {THREE.Vector3} world‐space base position
   * @param scale       {number} uniform scale of the entire candle
   */
  constructor(controller, position = new THREE.Vector3(), scale = 0.5) {
    super(controller, "Candle", 1);
    this.controller = controller;
    this.scale= scale;
    this.position = position;
    this.init();
  }

  async init() {
   this.clock = new THREE.Clock();

    // 1) Root group: the candle’s local origin
    this.group = new THREE.Group();
    this.group.position.copy(this.position); // place the origin
    this.group.scale.set(this.scale, this.scale, this.scale); // uniform size
    this.controller.scene.add(this.group);

    // 2) Point light, **as a child** so it moves & scales with the candle
    this.pointLight = new THREE.PointLight(0xffaa33, 10, 20);
    this.pointLight.position.set(0, 2, 0);
    this.group.add(this.pointLight);

    // 3) Wax body, **local coords** (0,0,0 is candle base)
    const waxGeom = new THREE.CylinderGeometry(0.25, 0.25, 2, 32);
    const waxMat = new THREE.MeshPhongMaterial({
      color: 0xaa0000,
      shininess: 30,
    });
    const wax = new THREE.Mesh(waxGeom, waxMat);
    wax.position.set(0, 1, 0);
    this.group.add(wax);

    // 5) Flame sprite
    const loader = new THREE.TextureLoader();
    const flameTex = loader.load("assets/models/textures/fire.png");
    this.flame = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: flameTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.9,
        depthWrite: false,
      })
    );
    this.flame.position.set(0, 2.4, 0);
    this.flame.scale.set(0.5, 1.0, 1);
    this.group.add(this.flame);

    // 6) Glow sprite
    const size = 128;
    const can = document.createElement("canvas");
    can.width = can.height = size;
    const ctx = can.getContext("2d");
    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    grad.addColorStop(0, "rgba(255,221,85,0.6)");
    grad.addColorStop(0.2, "rgba(255,221,85,0.2)");
    grad.addColorStop(1, "rgba(255,204,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const glowTex = new THREE.CanvasTexture(can);
    this.glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    this.glow.position.set(0, 2.4, 0);
    this.glow.scale.set(40, 40, 10);
    this.group.add(this.glow);
    this.register()
  }

  update() {
    const t = this.clock.getElapsedTime();
    const s = 1 + 0.05 * Math.sin(t * 20);

    // flicker flame
    this.flame.scale.set(0.5 * s, 1.0 * s, 1);

    // flicker light
    this.pointLight.intensity = 8  +  Math.sin(t * 2 + 1 * Math.random()) * 2;

    // flicker glow
    this.glow.scale.set(6 * s, 6 * s, 1);
    this.glow.material.opacity = 0.4 + 0.2 * Math.sin(t * 20 + 2);
  }
}
