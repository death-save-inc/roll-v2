import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { Candle } from "./candle.js";
import { FireEffect } from "../effects/fire-effect.js";

const RUNES = [
  "ᚠ",
  "ᚢ",
  "ᚦ",
  "ᚨ",
  "ᚱ",
  "ᚲ",
  "ᚷ",
  "ᚹ",
  "ᚺ",
  "ᚾ",
  "ᛁ",
  "ᛃ",
  "ᛈ",
  "ᛇ",
  "ᛉ",
  "ᛊ",
];

const COLORS = {
  circle: 0xff2200,
  star: 0xff0000,
  ring: 0xff2200,
  glyph: 0xfff200,
};

const COLORS2 = {
  circle: 0x6a0dad, // Rebecca Purple
  star: 0x00ffcc, // Purple (web)
  ring: 0x00ffcc, // Classic Purple
  glyph: 0xff2200, // Thistle (light lavender)
};

export class MagicCircleBase {
  constructor(controller) {
    this.controller = controller;
    this.group = new THREE.Group();
    this.fadeables = []; // materials to fade
    this.glyphItems = []; // for updating glyph textures

    // fade state
    this.fade = 0;
    this.targetFade = 0;

    this.baseYPosition = 2.75; // base Y position for the circle

    // add our group
    controller.scene.add(this.group);

    // build everything
    this.init();

    // collect fadeable materials
    this._collectFadeables();

    // register update loop (dt in seconds)
    controller.registerRenderAction("MagicCircleFade", /*order=*/ 1, () =>
      this.update()
    );
  }

  init() {
    this.makeLineMats();
    this.addPentagramWithCircles(this.group, 4, 0.5, 512);
    this.buildVFX(this.group, 4, 3);
    this._createFireEffect();
    this.fire.show = false; 
  }

  // fade controls
  show() {
    this.fire.show = true
    this.targetFade = 1;
  }
  hide() {
    this.fire.show = false
    this.targetFade = 0;
  }

  update(dt) {
    this.fade += (this.targetFade - this.fade) * 0.1;

    // apply to every fadeable material
    this.fadeables.forEach((mat) => {
      // LineMaterial (has uniforms.opacity)
      if (mat.isLineMaterial) {
        mat.uniforms.opacity.value = this.fade;
      } else {
        mat.opacity = this.fade;
      }
      mat.needsUpdate = true;
      mat.opacity = this.fade;
    });

    this.fire.update();
  }
  _collectFadeables() {
    // traverse group for any transparent materials
    this.group.traverse((o) => {
      if (o.material && o.material.transparent) {
        this.fadeables.push(o.material);
      }
    });
    // also glyph meshes (materials are MeshBasicMaterial)
    this.glyphItems.forEach(({ mesh }) => {
      if (mesh.material && mesh.material.transparent) {
        this.fadeables.push(mesh.material);
      }
    });
  }

  // create and register two LineMaterials (real + bloom) 
  _makeLineMats(colorHex, linewidth, transparent = true) {
    const mat = new LineMaterial({
      color: colorHex,
      linewidth: linewidth,
      transparent: transparent,
      blending: THREE.AdditiveBlending,
    });
    mat.resolution.set(window.innerWidth, window.innerHeight);
    this.fadeables.push(mat);

    // feed bloom
    const bloom = mat.clone();
    bloom.color = new THREE.Color(colorHex).multiplyScalar(10);
    bloom.resolution.set(window.innerWidth, window.innerHeight);
    this.fadeables.push(bloom);

    return [mat, bloom];
  }

  makeLine(points, mat) {
    const geo = new LineGeometry();
    geo.setPositions(points);
    return new Line2(geo, mat);
  }

  makeLineMats() {
    // outer circle
    [this.circleMat, this.circleBloomMat] = this._makeLineMats(
      COLORS.circle,
      4
    );

    // pentagram
    [this.starMat, this.starBloomMat] = this._makeLineMats(COLORS.star, 4);

    // inner rings
    [this.ringMat, this.ringBloomMat] = this._makeLineMats(COLORS.ring, 3);
  }

  addPentagramWithCircles(parent, R, rSmall, segs) {
    this.circleRadius = R;

    // 1) Outer circle
    const outer = [];
    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      outer.push(R * Math.cos(a), 0, R * Math.sin(a));
    }
    parent.add(this.makeLine(outer, this.circleBloomMat));
    parent.add(this.makeLine(outer, this.circleMat));

    // 2) Pentagram
    const tips = [];
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + Math.PI / 2;
      tips.push(
        new THREE.Vector3(R * Math.cos(a), this.baseYPosition, R * Math.sin(a))
      );
    }
    const order = [0, 2, 4, 1, 3, 0],
      star = [];
    order.forEach((i) => {
      const v = tips[i];
      star.push(v.x, this.baseYPosition, v.z);
    });
    parent.add(this.makeLine(star, this.starBloomMat));
    parent.add(this.makeLine(star, this.starMat));

    // 3) Small rings + candles
    const ringSegs = Math.floor(segs / 4);
    tips.forEach((v) => {
      new Candle(this.controller, v.clone());
      const ring = [];
      for (let j = 0; j <= ringSegs; j++) {
        const t = (j / ringSegs) * Math.PI * 2;
        ring.push(
          v.x + rSmall * Math.cos(t),
          this.baseYPosition,
          v.z + rSmall * Math.sin(t)
        );
      }
      parent.add(this.makeLine(ring, this.ringBloomMat));
      parent.add(this.makeLine(ring, this.ringMat));
    });
  }

  buildVFX(parent, R, ringCount) {
    const group = new THREE.Group();
    const h = this.baseYPosition,
      segs = 256,
      denom = ringCount + 1;
    parent.add(group);

    // outline circles
    for (let i = 1; i <= ringCount; i++) {
      const r = R * (i / denom),
        pts = [];
      for (let j = 0; j <= segs; j++) {
        const a = (j / segs) * Math.PI * 2;
        pts.push(r * Math.cos(a), h, r * Math.sin(a));
      }
      group.add(this.makeLine(pts, this.ringBloomMat));
      group.add(this.makeLine(pts, this.ringMat));
    }

    // glyph rings
    const hex = COLORS.glyph.toString(16).padStart(6, "0");
    const css = `#${hex}`;
    for (let i = 1; i <= denom; i++) {
      if (i === 1 || i === denom) continue; // skip first and last
      const r = R * ((i - 0.5) / denom);
      RUNES.forEach((ch, idx) => {
        const c = document.createElement("canvas");
        c.width = c.height = 128;
        const ctx = c.getContext("2d");
        const tex = new THREE.CanvasTexture(c);

        const mat = new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        this.fadeables.push(mat);

        const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
        m.rotation.x = -Math.PI / 2;
        const a = (idx / RUNES.length) * Math.PI * 2;
        m.position.set(Math.cos(a) * r, this.baseYPosition, Math.sin(a) * r);
        group.add(m);
        this.glyphItems.push({ mesh: m, ctx, tex, char: ch });
      });
    }

    this._updateGlyphTextures(css);
  }

  _updateGlyphTextures(css) {
    this.glyphItems.forEach(({ ctx, tex, char }) => {
      const s = ctx.canvas.width;
      ctx.clearRect(0, 0, s, s);
      ctx.fillStyle = css;
      ctx.shadowColor = css;
      ctx.shadowBlur = 12;
      ctx.font = "bold 80px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(char, s / 2, s / 2);
      tex.needsUpdate = true;
    });
  }

  _createFireEffect() {
    this.fire = new FireEffect(
      this.controller,
      new THREE.Vector3(0, 4, 0),
      1,
      10,
      400,
      0.5,
      0.0125
    );
  }
}
