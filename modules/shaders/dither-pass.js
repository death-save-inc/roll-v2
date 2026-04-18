import { DitherShader } from './dither-shader.js'

export function DitherPassGen({ THREE, Pass, FullScreenQuad }) {
  return class DitherPass extends Pass {
    constructor({
      resolution = new THREE.Vector2(0, 0),
      bias = 0,
      excludedColor = new THREE.Vector3(1, 1, 0),
      tolerance = 0.05,
      pixelSize = 2.5,
      scanlineStrength = 2.25,
      scanlineDensity = 10.0
    } = {}) {
      super();

      this.time = 0;

      this._fsQuad = new FullScreenQuad(new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(DitherShader.uniforms),
        vertexShader: DitherShader.vertexShader,
        fragmentShader: DitherShader.fragmentShader,
      }));

      this._fsQuad.material.uniforms.resolution.value = resolution;
      this._fsQuad.material.uniforms.bias.value = bias;
      this._fsQuad.material.uniforms.excludedColor.value = excludedColor;
      this._fsQuad.material.uniforms.tolerance.value = tolerance;
      this._fsQuad.material.uniforms.pixelSize.value = pixelSize;
      this._fsQuad.material.uniforms.scanlineStrength.value = scanlineStrength;
      this._fsQuad.material.uniforms.scanlineDensity.value = scanlineDensity;

      this._uniforms = this._fsQuad.material.uniforms;
    }

    render(renderer, writeBuffer, readBuffer, deltaTime /*, maskActive */) {
      this._uniforms.textureSampler.value = readBuffer.texture;

      this.time += deltaTime || 0;
      this._uniforms.uTime.value = this.time;

      if (this.renderToScreen) {
        renderer.setRenderTarget(null);
      } else {
        renderer.setRenderTarget(writeBuffer);
        if (this.clear) renderer.clear();
      }

      this._fsQuad.render(renderer);
    }

    get distortion() { return this._uniforms.resolution.value; }
    set distortion(value) { this._uniforms.resolution.value = value; }

    get principalPoint() { return this._uniforms.bias.value; }
    set principalPoint(value) { this._uniforms.bias.value = value; }
  };
}