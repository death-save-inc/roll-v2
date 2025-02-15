import * as THREE from "three";

export class RainEffect {
  constructor(scene, rainCount) {
    this.scene = scene;
    this.rainCount = rainCount;
    this.init();
  }

  init() {
    this.rainGeo = new THREE.BufferGeometry();
    const raindrops = [];

    for (let i = 0; i < this.rainCount; i++) {
      const raindrop = [
        Math.random() * 100 - 50,
        Math.random() * 200 - 100,
        Math.random() * 100 - 50,
      ];
      raindrops.push(...raindrop);
    }
    console.log(new Float32Array(raindrops));
    this.rainGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(raindrops), 3)
    );
    console.log(this.rainGeo.getAttribute("position"));
    this.rainMaterial = new THREE.PointsMaterial({
      color: 0xcccccc,
      size: 0.1,
      transparent: true,
    });
    this.rain = new THREE.Points(this.rainGeo, this.rainMaterial);
    this.scene.add(this.rain);
  }

  update() {
    const positionAttribute = this.rainGeo.getAttribute("position");

    const vertex = new THREE.Vector3();

    for (let i = 0; i < positionAttribute.count; i++) {
      vertex.fromBufferAttribute(positionAttribute, i); // read vertex
      vertex.velocity -= 0.1 + Math.random() * 0.1
      vertex.y -= 0.8
        if (vertex.y < -100){
            vertex.y = 100
        }
      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z); // write coordinates back
    }
    this.rainGeo.attributes.position.needsUpdate = true
    this.rainGeo.needsUpdate = true;
  }
}
