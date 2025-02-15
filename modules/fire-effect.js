import * as THREE from "three";
import {particleFire} from "../modules/lib/particle-fire.js";


particleFire.install( { THREE: THREE } );

export const FireEffect = (controller, position, three)=>{
    const fireRadius = 0.5;
    const fireHeight = 3;
    const particleCount = 400;
    console.log(particleFire)
    const geometry0 = new particleFire.Geometry( fireRadius, fireHeight, particleCount );
    const material0 = new particleFire.Material( { color: 0xff2200 } );
    material0.setPerspective( controller.camera.fov, window.innerHeight );
    const particleFireMesh0 = new THREE.Points( geometry0, material0 );
    particleFireMesh0.position.set(position.x, position.y, position.z)
    controller.scene.add( particleFireMesh0 );

    return particleFireMesh0
}