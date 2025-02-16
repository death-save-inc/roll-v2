import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import * as THREE from "three";

export class TextLoader {
  constructor(controller) {
    this.controller = controller
    this.loader = new FontLoader();
  }

  async createText(pathTofont, color, message) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        pathTofont,
        (font) => {
          const color = new THREE.Color(0xcccccc);

          const matDark = new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide,
          });

          const shapes = font.generateShapes(message, 100);

          const geometry = new THREE.ShapeGeometry(shapes);

          geometry.computeBoundingBox();

          const xMid =
            -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);

          geometry.translate(xMid, 0, 0);


          const holeShapes = [];

          for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];

            if (shape.holes && shape.holes.length > 0) {
              for (let j = 0; j < shape.holes.length; j++) {
                const hole = shape.holes[j];
                holeShapes.push(hole);
              }
            }
          }

          shapes.push.apply(shapes, holeShapes);

          const style = SVGLoader.getStrokeStyle(4, color.getStyle());

          const strokeText = new THREE.Group();

          for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];

            const points = shape.getPoints();

            const geometry = SVGLoader.pointsToStroke(points, style);

            geometry.translate(xMid, 0, 0);

            const strokeMesh = new THREE.Mesh(geometry, matDark);
            strokeText.add(strokeMesh);
          }
          strokeText.position.set(0, 0, 0)
          strokeText.rotateY(180 * (Math.PI / 180))
          resolve(strokeText)
        }
      );
    });
  }
}
