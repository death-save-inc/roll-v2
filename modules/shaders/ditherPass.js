import { DitherShader } from './dither.js'

export function DitherPassGen({ THREE, Pass, FullScreenQuad }) {

  // expose
  return class DitherPass extends Pass {

    constructor({
      resolution = new THREE.Vector2(0, 0),
      bias = 0.025
    } = {}) {
      super();

      this._fsQuad = new FullScreenQuad(new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(DitherShader.uniforms),
        vertexShader: DitherShader.vertexShader,
        fragmentShader: DitherShader.fragmentShader,
      }));

      console.log(this._fsQuad.material.uniforms)

      this._fsQuad.material.uniforms['resolution'].value = resolution; // radial distortion coeff of term r^2
      this._fsQuad.material.uniforms['bias'].value = bias;

      this._uniforms = this._fsQuad.material.uniforms;
    }

    render(renderer, writeBuffer, readBuffer) {
    //   this._fsQuad.material.uniforms['tDiffuse'].value = readBuffer.texture;
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