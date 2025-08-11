import * as THREE from "three";

export class FlyingRunes {
  constructor(controller) {
    this.controller = controller;
    this.scene = controller.scene;
    this.renderer = controller.renderer;

    // Fade
    this.fade = 0;
    this.targetFade = 0;

    this.basePositionY = 3; // base Y position

    // Hold refs for updates
    this.vfx = null;
    this.ringMats = [];
    this.glyphSprites = [];
    this.fadeables = [];

    this.COLORS = {
      ringInner: 0x1a0000, // almost black crimson
      ringMid: 0xff3200, // lava orange-red
      ringOuter: 0xfff4a3, // searing yellow-white edge
      midPos: 0.46, // where the orange peaks

      accent: 0xff6b00, // lines / glyphs / accents
      light: 0xff0000, // point light color
      glyph: 0xffaa22, // ember glyphs
    };

    this._buildVFX();
    this._collectFadeables();

    controller.registerRenderAction("flyingRunes", 5, () => this._update());
  }

  show() {
    this.targetFade = 1;
  }

  hide() {
    this.targetFade = 0;
  }

  // Build visuals
  _buildVFX() {
    this.vfx = new THREE.Group();
    this.scene.add(this.vfx);

    // GLYPHS
    const glyphs = [
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

    const glyphGroup = new THREE.Group();

    glyphs.forEach((ch, i) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 128;
      const ctx = canvas.getContext("2d");
      const tex = new THREE.CanvasTexture(canvas);

      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: tex,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          opacity: 1,
        })
      );

      const ang = (i / glyphs.length) * Math.PI * 2;
      const rad = 5;
      sprite.position.set(
        Math.cos(ang) * rad,
        this.basePositionY,
        Math.sin(ang) * rad
      );
      sprite.scale.set(0.9, 0.9, 1);
      glyphGroup.add(sprite);

      this.glyphSprites.push({ sprite, canvas, ctx, tex, char: ch });
    });
    this.vfx.add(glyphGroup);

    // Draw glyph textures with fixed color
    this._updateGlyphTextures();

    this.light = new THREE.PointLight(this.COLORS.light, 120, 0);
    this.light.position.set(0, 2, 0);
    this.light.castShadow = true;
    this.scene.add(this.light);
  }

  _updateGlyphTextures() {
    const css = "#" + this.COLORS.glyph.toString(16).padStart(6, "0");
    this.glyphSprites.forEach(({ ctx, canvas, tex, char }) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = css;
      ctx.shadowColor = css;
      ctx.shadowBlur = 12;
      ctx.font = "bold 140px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(char, 64, 64);
      tex.needsUpdate = true;
    });
  }

  // Fade bookkeeping
  _collectFadeables() {
    this.fadeables.length = 0;

    const isAdditive = (m) => m && m.blending === THREE.AdditiveBlending;
    const hasFadeUniform = (m) =>
      m && m.uniforms && m.uniforms.fadeFactor !== undefined;

    this.vfx.traverse((o) => {
      const m = o.material;
      if (!m || !m.transparent) return;
      const useOpacity = !(isAdditive(m) && hasFadeUniform(m));
      this.fadeables.push({ mat: m, useOpacity });
    });
  }

  // Update loop
  _update() {
    const t = this.controller.clock.getElapsedTime();
    const dt = this.controller.clock.getDelta();

    // Fade lerp
    this.fade = THREE.MathUtils.lerp(this.fade, this.targetFade, 0.1);
    const f = this.fade;

    // Apply fade
    this.fadeables.forEach(({ mat, useOpacity }) => {
      if (mat.uniforms?.fadeFactor !== undefined)
        mat.uniforms.fadeFactor.value = f;
      if (useOpacity && mat.opacity !== undefined) mat.opacity = f;
    });

    // Animate rings
    this.ringMats.forEach((m) => (m.uniforms.time.value = t));

    // Scale pulse
    this.vfx.scale.setScalar(1 + 0.1 * Math.sin(t * 2));

    // Light pulse based on fade
    this.light.intensity = 30 + Math.sin(t * 0.8) * 10;
    this.light.intensity *= f;

    this.vfx.rotation.y += dt * 0.4; // slow rotation
  }
}
