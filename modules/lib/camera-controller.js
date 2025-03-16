
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export class CameraController {
    constructor(controller, domElement) {
        this.controller = controller
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.2,
            2000
        );

        this.camera.layers.enableAll();
        this.controls = new OrbitControls(this.camera, domElement);
        this.controls.update();
        this.controls.target = new THREE.Vector3(0, 6, 0);
        this.camera.position.set(-1, 4, -12);

        this.cameraTarget = {
            position: new THREE.Vector3(-1, 4, -12),
            rotation: this.camera.rotation
        }
    }

    update() {
        this.camera.position.lerp(this.cameraTarget.position, 0.01);
    }

    setTargetPosition(position, target) {
        this.cameraTarget.position = position
            this.controls.target = target
    }

    setTargetRotation(rotation){
    }
}