import * as THREE from "three";

export class LightningEffect {
  constructor(scene, maxBrightness, minBrightness) {
    this.scene = scene;
    this.maxBrightness = maxBrightness;
    this.minBrightness = minBrightness;
    this.flashBuffer = [];
    this.ready = false;
    this.init();
  }

  init() {
    this.light = new THREE.DirectionalLight(new THREE.Color().setRGB(1, 1, 1), 0);
    this.light.castShadow = true;
    this.scene.add(this.light);
    this.nextFlash = this.calcNextFlash();
    this.ready = true;
    this.flashTimer()
  }

  fillFlashBuffer() {
    const r = this.randomRange(4, 10);
    this.flashBuffer = [];
    for (let i = 0; i < r; i++) {
      this.flashBuffer.push({
        intensity: this.randomRange(this.minBrightness, this.maxBrightness),
        delay: this.randomRange(1,2) * 100,
      });
    }
  }

  async flashTimer() {
    this.fillFlashBuffer();
    return new Promise((resolve, _) => {
      const timeout = setTimeout(async () => {
        for (const flash of this.flashBuffer) {
          await this.flash(flash);
        }
        clearTimeout(timeout);
        this.setBrightness(0)
        resolve();
      }, this.randomRange(4, 8) * 1000);
    });
  }

  flash(flash) {
    return new Promise((resolve, _) => {
        this.setBrightness(flash.intensity);
        setTimeout(()=>{
          this.setBrightness(0)
          resolve();
        },flash.delay)
    });
  }

  calcNextFlash(min, max) {
    const now = new Date();
    const next = this._addSeconds(now, this.randomRange(min, max));
    return next.getTime();
  }

  _addSeconds(date, seconds) {
    const dateCopy = new Date(date);
    dateCopy.setSeconds(date.getSeconds() + seconds);
    return dateCopy;
  }

  randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  setBrightness(brightness) {
    this.light.intensity = brightness;
  }

  async update() {
  }
}
