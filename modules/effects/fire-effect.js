import * as THREE from "three";
import { particleFire } from "../lib/particle-fire.js";
import { randomRange } from "../utils/utils.js";

particleFire.install({ THREE: THREE });

export class FireEffect {
  constructor(
    controller,
    position,
    radius,
    height,
    particleCount,
    intensity,
    speed
  ) {
    this.controller = controller;
    this.position = position;
    this.radius = radius;
    this.height = height;
    this.particleCount = particleCount;
    this.intensity = intensity;
    this.speed = speed;
    this.ready = false;

    this.init();
  }

  init() {
    const geometry = new particleFire.Geometry(
      this.radius,
      this.height,
      this.particleCount
    );
    const material = new particleFire.Material({ color: 0xaaaaaa });
    material.setPerspective(this.controller.camera.fov, window.innerHeight);
    this.particleFireMesh = new THREE.Points(geometry, material);
    this.particleFireMesh.position.set(
      this.position.x,
      this.position.y,
      this.position.z
    );
    this.controller.scene.add(this.particleFireMesh);

    this.light = new THREE.PointLight(0xffffff, this.intensity, 0, 1.75);
    this.light.position.set(
      this.position.x,
      this.position.y + 1,
      this.position.z
    );

    this.controller.scene.add(this.light);
    this.ready = true;
  }

  update() {
    if (!this.ready) return;
    this.particleFireMesh.material.update(Math.random() * this.speed);
    this.light.intensity += randomRange(-0.4, 0.4);
    if (this.light.intensity < 0 || this.light.intensity > this.intensity + 2) {
      this.light.intensity = this.intensity;
    }
  }
}
