import * as CANNON from "cannon"
import * as THREE from "three"
export class Physics {
    constructor(controller) {
        this.controller = controller
        console.log(this.controller)
        this.init()
        this.ready = false
    }

    init() {
        this.world = new CANNON.World()
        this.world.autoStep = false;
        this.world.gravity.set(0, -9.82, 0)
        // world.allowSleep = true

        this.world.broadphase = new CANNON.NaiveBroadphase(this.world)
        const material = new CANNON.Material();
        const contactMaterial = new CANNON.ContactMaterial(material, material, {
            friction: 10, // Adjust friction
            restitution: 0.0 // Adjust bounce
        });
        this.world.addContactMaterial(contactMaterial);

        setTimeout(() => {
            this.ready = true
        }, 200)

        // Or add a contact event listener:
        this.world.addEventListener('collide', (e) => {
            console.log('Collision detected:', e.body, 'collided with', e.otherBody);
        });

        this.setBoundries()

        // const size = 20
        // const halfExtents = new CANNON.Vec3(size, size, size)
        // const boxShape = new CANNON.Box(halfExtents)
        // const boxBody = new CANNON.Body({ mass: 0, shape: boxShape })
        // this.world.addBody(boxBody)
        // boxBody.position.set(0, 5, 0)

        // const geometry = new THREE.BoxGeometry(size, size, size);
        // const mat = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        // const cube = new THREE.Mesh(geometry, mat);
        // cube.position.set(boxBody.position.x, boxBody.position.y, boxBody.position.z)
        // this.controller.scene.add(cube);

    }

    addBody(body) {
        this.world.addBody(body)
    }

    removeBody(body){
      this.world.removeBody(body)
    }

    update(delta) {
        if (this.world && this.ready) {
            // Relaxation
            this.world.step(1 / 60); // Add more substep
            // this.cannonDebugRenderer.update()
        }

    }

    setBoundries() {
        const boxSize = 30;
        const wallThickness = 0.5;
        const half = boxSize / 2;
        const material = new THREE.MeshStandardMaterial({ color: 0x808080, transparent: true, opacity: 0.3 });
        
        // Helper function to create walls
        const  createWall = (position, size, rotation = [0, 0, 0])=> {
          // Cannon body
          const shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
          const body = new CANNON.Body({
            type: CANNON.Body.STATIC,
            shape,
            position: new CANNON.Vec3(position.x, position.y, position.z),
          });
          body.quaternion.setFromEuler(...rotation);
          this.world.addBody(body);
        
          // Three.js mesh
          const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.copy(position);
          mesh.rotation.set(...rotation);
          this.controller.scene.add(mesh);
        }
        
        // Create walls
        createWall(             // Floor
          new THREE.Vector3(0, -half, 0),
          new THREE.Vector3(boxSize, wallThickness, boxSize)
        );
        createWall(             // Ceiling
          new THREE.Vector3(0, half, 0),
          new THREE.Vector3(boxSize, wallThickness, boxSize)
        );
        createWall(             // Left wall
          new THREE.Vector3(-half, 0, 0),
          new THREE.Vector3(wallThickness, boxSize, boxSize)
        );
        createWall(             // Right wall
          new THREE.Vector3(half, 0, 0),
          new THREE.Vector3(wallThickness, boxSize, boxSize)
        );
        createWall(             // Back wall
          new THREE.Vector3(0, 0, -half),
          new THREE.Vector3(boxSize, boxSize, wallThickness)
        );
        createWall(             // Front wall
          new THREE.Vector3(0, 0, half),
          new THREE.Vector3(boxSize, boxSize, wallThickness)
        );
    }

}