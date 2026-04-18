import * as THREE from 'three';

export const DitherShader = {
  uniforms: {
    textureSampler: { value: null },
    resolution: new THREE.Uniform(
      new THREE.Vector2(window.innerWidth, window.innerHeight)
    ),

    bias: { value: 0.02 },
    excludedColor: { value: new THREE.Vector3(1, 1, 0) },
    tolerance: { value: 0.05 },
    uTime: { value: 0 },

    // New controls
    pixelSize: { value: 2.5 },       // Bigger = chunkier dither blocks
    scanlineStrength: { value: 2.25 }, // 0.0 -> off, ~0.08-0.18 nice range
    scanlineDensity: { value: 10.0 }    // 1.0 = one line per screen pixel row
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    precision highp float;

    uniform float bias;
    uniform vec2 resolution;
    uniform sampler2D textureSampler;
    uniform vec3 excludedColor;
    uniform float tolerance;
    uniform float uTime;

    uniform float pixelSize;
    uniform float scanlineStrength;
    uniform float scanlineDensity;

    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    const float bayerMatrix8x8[64] = float[64](
      0.0/64.0, 48.0/64.0, 12.0/64.0, 60.0/64.0,  3.0/64.0, 51.0/64.0, 15.0/64.0, 63.0/64.0,
      32.0/64.0, 16.0/64.0, 44.0/64.0, 28.0/64.0, 35.0/64.0, 19.0/64.0, 47.0/64.0, 31.0/64.0,
      8.0/64.0, 56.0/64.0,  4.0/64.0, 52.0/64.0, 11.0/64.0, 59.0/64.0,  7.0/64.0, 55.0/64.0,
      40.0/64.0, 24.0/64.0, 36.0/64.0, 20.0/64.0, 43.0/64.0, 27.0/64.0, 39.0/64.0, 23.0/64.0,
      2.0/64.0, 50.0/64.0, 14.0/64.0, 62.0/64.0,  1.0/64.0, 49.0/64.0, 13.0/64.0, 61.0/64.0,
      34.0/64.0, 18.0/64.0, 46.0/64.0, 30.0/64.0, 33.0/64.0, 17.0/64.0, 45.0/64.0, 29.0/64.0,
      10.0/64.0, 58.0/64.0,  6.0/64.0, 54.0/64.0,  9.0/64.0, 57.0/64.0,  5.0/64.0, 53.0/64.0,
      42.0/64.0, 26.0/64.0, 38.0/64.0, 22.0/64.0, 41.0/64.0, 25.0/64.0, 37.0/64.0, 21.0/64.0
    );

    float getBayerThreshold(vec2 fragCoord) {
      // Quantize screen coords so Bayer cells become larger
      vec2 blockCoord = floor(fragCoord / pixelSize);

      // Small animated drift so pattern feels alive
      vec2 drift = vec2(
        sin(uTime * 0.9) * 1.5,
        cos(uTime * 1.1) * 1.5
      );

      ivec2 coord = ivec2(mod(blockCoord + floor(drift), 8.0));
      return bayerMatrix8x8[coord.y * 8 + coord.x];
    }

float getScanlineMask(vec2 fragCoord) {
    // Bigger value = thicker visible CRT bands
    float lineHeight = 3.0;

    // Quantize rows into larger horizontal bands
    float band = floor(fragCoord.y / lineHeight);

    // Alternate bright/dark bands
    float scan = mod(band, 2.0);

    // Optional subtle animated shimmer
    float shimmer = 0.97 + 0.03 * sin(uTime * 8.0 + band * 0.15);

    // Darken every other band
    return mix(1.0 - scanlineStrength, 1.0, scan) * shimmer;
}

    vec3 orderedDither(vec2 fragCoord, vec3 color) {
      float diff = distance(color, excludedColor);
      if (diff < tolerance) {
        return color;
      }

      float threshold = getBayerThreshold(fragCoord);

      // Stable moving grain, bounded forever
      vec2 grainCoord = floor(fragCoord / max(pixelSize, 1.0))
                      + vec2(uTime * 24.0, uTime * 17.0);

      float grain = rand(grainCoord) * 2.0 - 1.0;
      float flicker = 0.5 + 0.5 * sin(uTime * 2.5);
      float grainStrength = mix(0.008, 0.025, flicker);

      vec3 noisyColor = color + vec3(grain) * grainStrength;
      noisyColor = clamp(noisyColor, 0.0, 1.0);

      vec3 dithered = step(vec3(threshold + bias), noisyColor) * noisyColor;
      return dithered;
    }

    void main(void) {
      vec4 color = texture2D(textureSampler, vUv);

      vec3 dithered = orderedDither(gl_FragCoord.xy, color.rgb);

      // Apply CRT scanlines after dithering
      float scanlineMask = getScanlineMask(gl_FragCoord.xy);
      dithered *= scanlineMask;

      gl_FragColor = vec4(dithered, color.a);
    }
  `
};