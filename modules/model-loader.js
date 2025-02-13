import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class ModelLoader {
    constructor(scene) {
        this.scene = scene
        this.GLTFLoader = new GLTFLoader()
    }

    async loadModel(path){
        const extension = path.split(".")[1]
        switch (extension) {
            case "gltf":
                return this._loadGLTF(path)
            case "glb":
                return this._loadGLTF(path)
            default:
                break;
        }
    }

    async _loadGLTF(path) {
        return new Promise((resolve, reject) => {
            this.GLTFLoader.load(path, (gltf) => {
                resolve(gltf)    
            }, undefined, function (error) {
                reject(error);
            });
        })
    }
}


