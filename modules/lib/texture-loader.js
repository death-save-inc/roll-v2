import * as THREE from "three";

export class TextureLoader {
    constructor() {
        this.loader = new THREE.TextureLoader();
    }

    async load(path) {
        return new Promise((resolve, reject) => {
            // load a resource
            this.loader.load(
                path,
                (texture) => {
                    resolve(texture)
                },
                undefined,
                (err) => {
                    console.error('An error happened.');
                    reject(err)
                }
            );
        })
    }
}