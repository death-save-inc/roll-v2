// summoningCircle.js
import * as THREE from "three";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js";

// Easing
function easeInOutQuad(t) {
  return t < 0.5
    ? 2 * t * t
    : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

//  Curve with horizontal jitter + procedural noise
export class LeveledSpiralCurve extends THREE.Curve {
  constructor(offsetAngle, parent) {
    super();
    this.offset    = offsetAngle;
    this.parent    = parent;

    // base random jitter
    const a           = Math.random() * Math.PI ;
    this.jitterDir    = new THREE.Vector3(Math.cos(a), 0,  Math.sin(a));
    this.jitterAmp    = parent.RADIUS_BOTTOM * 0.9;

    // procedural noise
    this.noise        = new SimplexNoise();
  }

  getPoint(t) {
    // 1) vertical
    const y = t * this.parent.TENTACLE_HEIGHT;

    // 2) eased spiral radius & angle
    const s     = easeInOutQuad(t);
    const r     = THREE.MathUtils.lerp(
      this.parent.RADIUS_BOTTOM,
      this.parent.CENTER_RADIUS,
      s
    );
    const angle = this.offset + s * this.parent.TURN_COUNT * Math.PI * 2;

    // 3) base position
    const pos = new THREE.Vector3(
      Math.cos(angle) * r,
      y,
      Math.sin(angle) * r
    );

    // 4) decaying jitter
    const decay = s;
    pos.addScaledVector(this.jitterDir, this.jitterAmp * decay);

    // 5) add high‑frequency noise for chaotica
    const freq     =  1;
    const ampNoise = this.jitterAmp * decay * 0.2;
    const nx       = this.noise.noise3d(pos.x * freq, pos.y * freq, t * 4);
    const nz       = this.noise.noise3d(pos.z * freq, pos.y * freq, t * 4 + 37);
    pos.x += nx * ampNoise;
    pos.z += nz * ampNoise;

    return pos;
  }
}

//  SummoningCircle class ─
export class MagicSwirles {
  constructor(controller) {
    this.controller    = controller;
    this.scene         = controller.scene;
    this.renderer      = controller.renderer;

    // fade state
    this.fade          = 0;
    this.targetFade    = 0;
    this.fadeables     = [];

    this.tubes         = [];
    this.caps          = [];
    this.vfx           = new THREE.Group();
    this.scene.add(this.vfx);
    this.clock         = new THREE.Clock();

    // config
    this.ARM_COUNT        = 6;
    this.TENTACLE_HEIGHT  = 15;
    this.GROW_DURATION    = 1.0;
    this.CENTER_RADIUS    = 10;
    this.RADIUS_BOTTOM    = 1;
    this.TURN_COUNT       = 0.1;
    this.TUBULAR_SEGMENTS = 300;
    this.RADIAL_SEGMENTS  = 100;
    this.TUBE_RADIUS      = 0.025;

    // color palettes
    //lighitng style colors
    this.COLORS = [
      0x2D4586, // blue
      0x4A6BBE, // light blue
    ];

    this._buildVFX();
    this._collectFadeables();

    controller.registerRenderAction(
      "lightnigSwirles",
      5,
      () => this._update()
    );
  }

  show() {
    this.targetFade = 0.1;
    this._triggerGrow();
  }
  hide() {
    this.targetFade = 0;
  }

  _buildVFX() {
    this.pointlight = new THREE.PointLight(
      0xffffff, 0, 0, 0.5
    );
    this.pointlight.position.set(0, 2, 0);
    this.pointlight.castShadow = true;
    this.vfx.add(this.pointlight);
    const matProps = {
      transparent: true,
      blending:    THREE.AdditiveBlending,
      depthWrite:  true,
      depthTest:   true,
      side:        THREE.DoubleSide,
      opacity:     0
    };

    for (let i = 0; i < this.ARM_COUNT; i++) {
      const offset = (i / this.ARM_COUNT) * Math.PI * 2;
      const curve  = new LeveledSpiralCurve(offset, this);

      // tube
      const geo = new THREE.TubeGeometry(
        curve,
        this.TUBULAR_SEGMENTS,
        this.TUBE_RADIUS,
        this.RADIAL_SEGMENTS,
        false
      );
      const mat = new THREE.MeshBasicMaterial({
        ...matProps,
        color:     this.COLORS[i % this.COLORS.length],
        emissive:  new THREE.Color(this.COLORS[i % this.COLORS.length]),
      });

      // hide by default
      geo.setDrawRange(0, 0);
      const tube = new THREE.Mesh(geo, mat);
      this.vfx.add(tube);
      this.tubes.push({ mesh: tube, maxIdx: geo.index.count });

      // cap at tip
      const tipPos = curve.getPoint(1);
      const capGeo = new THREE.SphereGeometry(
        this.TUBE_RADIUS,
        this.RADIAL_SEGMENTS,
        this.RADIAL_SEGMENTS
      );
      const capMat = mat.clone();
      const cap    = new THREE.Mesh(capGeo, capMat);
      cap.position.copy(tipPos);
      cap.visible = false;
      this.vfx.add(cap);
      this.caps.push({ mesh: cap, threshold: 0.99 });
    }
  }

  _collectFadeables() {
    this.vfx.traverse(o => {
      if (o.material && o.material.transparent) {
        this.fadeables.push(o.material);
      }
    });
  }

  _triggerGrow() {
    this.isGrowing    = true;
    this.hasCompleted = false;
    this.growStart    = this.clock.getElapsedTime();
    this.vfx.visible  = true;
    this.pointlight.intensity = 2
  }

  _update() {
    const t  = this.clock.getElapsedTime();
    const dt = this.clock.getDelta();

    // simple fade toward target
    this.fade += (this.targetFade - this.fade) * 0.1;
    this.fadeables.forEach(m => m.opacity = this.fade);

    // grow animation
    if (this.isGrowing && !this.hasCompleted) {
      this.fade = 1;
      let p = (t - this.growStart) / this.GROW_DURATION;
      p = THREE.MathUtils.clamp(p, 0, 1);
      const eased = easeInOutQuad(p);

      this.tubes.forEach(({ mesh, maxIdx }) => {
        mesh.geometry.setDrawRange(0, Math.floor(maxIdx * eased));
      });
      this.caps.forEach(({ mesh, threshold }) => {
        mesh.visible = p >= threshold;
      });

      if (p === 1) {
        this.hasCompleted = true;
        this.isGrowing    = false;
        this.vfx.visible  = false;
      }
    }

    // rotate & pulse
    this.vfx.rotation.y += dt * 0.08;
    const pulse = 0.5 + 0.5 * Math.sin(t * 0.6);
    this.vfx.scale.setScalar(1 + 0.05 * pulse);
  }
}
