import { DitherShader } from './dither-shader.js'

export function DitherPassGen({ THREE, Pass, FullScreenQuad }) {

  return class DitherPass extends Pass {

    constructor({
      resolution = new THREE.Vector2(0, 0),
      bias = 0
    } = {}) {
      super();

      this._fsQuad = new FullScreenQuad(new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(DitherShader.uniforms),
        vertexShader: DitherShader.vertexShader,
        fragmentShader: DitherShader.fragmentShader,
      }));

      this._fsQuad.material.uniforms['resolution'].value = resolution;
      this._fsQuad.material.uniforms['bias'].value = bias;

      this._uniforms = this._fsQuad.material.uniforms;
    }

    render(renderer, writeBuffer, readBuffer) {
      this._fsQuad.material.uniforms['textureSampler'].value = readBuffer.texture // Update time uniform
      this._fsQuad.material.uniforms['uTime'].value = performance.now() / 10000000000; // Convert to seconds

      if (this.renderToScreen) {
        renderer.setRenderTarget(null);
      } else {
        renderer.setRenderTarget(writeBuffer);
        if (this.clear) renderer.clear();
      }
      this._fsQuad.render(renderer);
    }

    get distortion() { return this._uniforms['resolution'].value }
    set distortion(value) { this._uniforms['resolution'].value = value }

    get principalPoint() { return this._uniforms['bias'].value }
    set principalPoint(value) { this._uniforms['bias'].value = value }


  };
}