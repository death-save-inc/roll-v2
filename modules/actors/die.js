import * as THREE from "three";
import { TextRenderer } from "../lib/text-renderer.js";
import * as CANNON from "cannon"
import { randomRange } from "../utils/utils.js";

export class Die {
  constructor(controller, color) {
    this.controller = controller
    this.color = color
    this.textRenderer = new TextRenderer(this.controller)
    this.init()
  }

  async init() {
    this.createGeometry()
    this.updatePhysics = this.createPhysicsBodyForGroup(this.model);
    // Assuming you have already created the physics body
    // Apply a force to make it spin and move like a die being thrown
  


  }

  async roll() {
    this.body.position.y += 5
    // const linearImpulse = new CANNON.Vec3( Math.random(), Math.random() ,  Math.random()); // Random direction for the throw
    // this.body.applyImpulse(linearImpulse, this.body.position);
    const angularImpulse = new CANNON.Vec3(Math.random() * 10, Math.random() * 10, Math.random()*10); // Random spin values
    this.body.applyTorque(angularImpulse);
    return new Promise((resolve, _) => {
      console.log(this.isBodySleeping())
      const interval = setInterval(() => {
        console.log('sleeping', this.isBodySleeping(0.1))
        if (this.isBodySleeping(0.1)) {
          clearTimeout(interval)
          this.body.sleep()
          resolve(this.getTopFace(this.body, this.faceNormals))
        }
      }, 200);
    })
  }

  // checkResult(){

  // }

  createNumberTexture(number, size = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, size, size);

    // Draw centered number
    ctx.fillStyle = '#ffff00';
    ctx.font = `${size * 0.5}px runescape`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Assuming your canvas element is ctx


    ctx.fillText(number.toString(), size / 2, size * 0.76);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  createIcosahedronFaceNormals(geometry) {
    const faceNormals = [];
    const posAttr = geometry.getAttribute('position');

    // Iterate through each face (each 3 vertices)
    for (let i = 0; i < posAttr.count; i += 3) {
      const vA = new THREE.Vector3().fromBufferAttribute(posAttr, i);
      const vB = new THREE.Vector3().fromBufferAttribute(posAttr, i + 1);
      const vC = new THREE.Vector3().fromBufferAttribute(posAttr, i + 2);

      // Compute the normal for the triangle face using the cross-product
      const edge1 = new THREE.Vector3().subVectors(vB, vA);
      const edge2 = new THREE.Vector3().subVectors(vC, vA);
      const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();

      faceNormals.push(normal);
    }

    return faceNormals;
  }

  createGeometry() {
    // Create the D20
    const radius = 0.5;
    const icosa = new THREE.IcosahedronGeometry(radius, 0).toNonIndexed();
    this.faceNormals = this.createIcosahedronFaceNormals(icosa);
    const posAttr = icosa.getAttribute('position');

    const d20Group = new THREE.Group();

    for (let i = 0; i < posAttr.count; i += 3) {
      const vA = new THREE.Vector3().fromBufferAttribute(posAttr, i);
      const vB = new THREE.Vector3().fromBufferAttribute(posAttr, i + 1);
      const vC = new THREE.Vector3().fromBufferAttribute(posAttr, i + 2);

      // Normal triangle face geometry (no manual UV or vertex manipulation)
      const faceGeo = new THREE.BufferGeometry();
      faceGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
        vA.x, vA.y, vA.z,
        vB.x, vB.y, vB.z,
        vC.x, vC.y, vC.z,
      ]), 3));

      faceGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([
        0.5, 1.0,  // top point of the triangle (UV centered)
        0.0, 0.0,  // bottom-left point of the triangle (UV mapped)
        1.0, 0.0,  // bottom-right point of the triangle (UV mapped)
      ]), 2));
      faceGeo.computeVertexNormals();

      const faceMesh = new THREE.Mesh(faceGeo);
      // Create texture with number
      const texture = this.createNumberTexture(i / 3 + 1, 256); // Use face index for number
      const boundingBoxNameMesh = new THREE.Box3().setFromObject(faceMesh);

      const size = boundingBoxNameMesh.getSize(new THREE.Vector3(0, 0, 0))
      // const texture = this.textRenderer.createTextTexture(String(i / 3 + 1), size, 1024, 100); // Use face index for number
      faceMesh.material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
      // Add the face mesh to the group (position at the centroid is optional)
      d20Group.add(faceMesh);
    }
    this.model = d20Group
    this.controller.scene.add(d20Group);
  }

  createPhysicsBodyForGroup(group) {
    const vertices = [];
    const faces = []; // Faces array should be populated correctly

    group.children.forEach(mesh => {
        if (mesh.isMesh) {
            const geometry = mesh.geometry;

            if (!geometry.attributes.position) {
                console.error("Mesh does not have position attribute!");
                return;
            }

            const positions = geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                vertices.push(new CANNON.Vec3(positions[i], positions[i + 1], positions[i + 2]));
            }

            // If using indexed geometry, extract faces
            if (geometry.index) {
                const indices = geometry.index.array;
                for (let i = 0; i < indices.length; i += 3) {
                    faces.push([indices[i], indices[i + 1], indices[i + 2]]);
                }
            } else {
                // If non-indexed, create faces manually (assume triangles)
                const count = geometry.attributes.position.count;
                for (let i = 0; i < count; i += 3) {
                    faces.push([i, i + 1, i + 2]); // Simple triangulation
                }
            }
        }
    });

    console.log('Vertices:', vertices.length, 'Faces:', faces.length);

    // Check if faces are correctly populated
    if (faces.length === 0) {
        console.error('No faces found!');
    }

    // Create the convex hull shape from the vertices
    const shape = new CANNON.ConvexPolyhedron({
        vertices: vertices.filter(v => v instanceof CANNON.Vec3 && Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z)),
        faces: faces
    });

    console.log('Convex Polyhedron Shape:', shape);

    const body = new CANNON.Body({
        mass: 5,
        position: new CANNON.Vec3(randomRange(-10,10), 10, -5  + Math.random() *5), // Position adjustment
        shape: shape
    });

    console.log('Body Position:', body.position);
    console.log('Body Shape:', body.shapes);
    body.sleep()

    // Add the body to the world
    this.controller.physics.addBody(body);

    // Create the visual mesh for the body
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    shape.vertices.forEach(vertex => {
        positions.push(vertex.x, vertex.y, vertex.z);
    });
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));

    const material = new THREE.MeshBasicMaterial({ color: this.color, wireframe: true });
    const visualMesh = new THREE.Mesh(geometry, material);
    this.controller.scene.add(visualMesh);

    // Store reference to the visual mesh
    body.visualMesh = visualMesh;

    this.body = body;

}

  

  createIcosahedronFaceNormals(geometry) {
    const faceNormals = [];
    const posAttr = geometry.getAttribute('position');

    // Iterate through each face (each 3 vertices)
    for (let i = 0; i < posAttr.count; i += 3) {
      const vA = new THREE.Vector3().fromBufferAttribute(posAttr, i);
      const vB = new THREE.Vector3().fromBufferAttribute(posAttr, i + 1);
      const vC = new THREE.Vector3().fromBufferAttribute(posAttr, i + 2);

      // Compute the normal for the triangle face using the cross-product
      const edge1 = new THREE.Vector3().subVectors(vB, vA);
      const edge2 = new THREE.Vector3().subVectors(vC, vA);
      const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();

      faceNormals.push(normal);
    }

    return faceNormals;
  }
  getTopFace() {
    if (!this.body || !this.faceNormals) return 0;

    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion(
      this.body.quaternion.x,
      this.body.quaternion.y,
      this.body.quaternion.z,
      this.body.quaternion.w
    );

    let maxDot = -Infinity;
    let topFaceIndex = -1;

    for (let i = 0; i < this.faceNormals.length; i++) {
      const localNormal = this.faceNormals[i].clone();
      const worldNormal = localNormal.applyQuaternion(quat); // Rotate into world space
      const dot = worldNormal.dot(up);

      if (dot > maxDot) {
        maxDot = dot;
        topFaceIndex = i;
      }
    }

    // Return face number (1-indexed)
    return topFaceIndex + 1;
  }
  isBodySleeping(threshold = 0.1) {
    const linearSpeed = this.body.velocity.length();
    const angularSpeed = this.body.angularVelocity.length();
    return linearSpeed < threshold && angularSpeed < threshold;
  }


  //   this.controller.physics.addBody(body);
  update() {
    this.faceNormals.forEach((normal, index) => {
      if (normal.length() === 0) {
        console.error(`Invalid normal on face ${index + 1}`);
      }
    });
    if (this.model && this.body) {
      this.model.position.copy(this.body.position);
      this.model.quaternion.set(this.body.quaternion.x, this.body.quaternion.y, this.body.quaternion.z, this.body.quaternion.w)
      this.body.visualMesh.position.copy(this.body.position);
      this.body.visualMesh.quaternion.set(this.body.quaternion.x, this.body.quaternion.y, this.body.quaternion.z, this.body.quaternion.w)
    }

  }
}