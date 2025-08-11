import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EventBus } from "../lib/eventbus.js";

export class CameraController {
  constructor(controller, domElement) {
    this.controller = controller;

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.2,
      2000
    );
    this.camera.layers.enableAll();
    this.controls = new OrbitControls(this.camera, domElement);
    this.controls.update();

    // default view
    this.camera.position.set(-1, 7, -12);
    this.controls.target.set(0, 6, 0);

    // target we’re lerping toward
    this.cameraTarget = {
      position: this.camera.position.clone(),
      target: this.controls.target.clone(),
    };

    // shake state
    this._shakeTime = 0;
    this._shakeDuration = 0;
    this._shakeAmp = 0;

    // events
    EventBus.on("spell:cast", () => {
      this.setRollView();
      this.shake(0.4, 1.5); // half‑unit shake for 0.5s
    });
    EventBus.on("roll:complete", () => {
      this.setCardView();
    });

    // register with your main loop
    controller.registerRenderAction("camera", 1, () => this.update());
  }

  setRollView() {
    this.setTargetPosition(
      new THREE.Vector3(-3, 15, -18),
      new THREE.Vector3(0, 6, 0)
    );
  }

  setCardView() {
    this.setTargetPosition(
      new THREE.Vector3(-1, 12, -15),
      new THREE.Vector3(0, 10, 0)
    );
  }

  setTargetPosition(position, target) {
    this.cameraTarget.position.copy(position);
    this.cameraTarget.target.copy(target);
  }

  // Kick off a shake of `amp` (world units) lasting `duration` seconds.
  shake(amp = 1, duration = 0.5) {
    this._shakeAmp = amp;
    this._shakeDuration = duration;
    this._shakeTime = 0;
  }

  update() {
    // 1) Smoothly move camera.position → cameraTarget.position
    this.camera.position.lerp(this.cameraTarget.position, 0.025);
    // and move control target
    this.controls.target.lerp(this.cameraTarget.target, 0.025);

    // 2) If shaking, add a random offset
    if (this._shakeTime < this._shakeDuration) {
      // advance time
      this._shakeTime += this.controller.clock.getDelta();

      // decay from 1 → 0
      const t = this._shakeTime / this._shakeDuration;
      const decay = 1 - t;

      // random in [-1,1]
      const rx = (Math.random() * 2 - 1) * this._shakeAmp * decay;
      const ry = (Math.random() * 2 - 1) * this._shakeAmp * decay;
      const rz = (Math.random() * 2 - 1) * this._shakeAmp * decay;

      this.camera.position.add(new THREE.Vector3(rx, ry, rz));
    }

    this.controls.update();
  }
}
