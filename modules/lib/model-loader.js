import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class ModelLoader {
    constructor(scene) {
        this.scene = scene;
        this.GLTFLoader = new GLTFLoader();
        this.mixers = [];
    }

    async loadModel(path) {
        const extension = path.split(".").pop().toLowerCase();

        switch (extension) {
            case "gltf":
            case "glb":
                return this._loadGLTF(path);
            default:
                throw new Error(`Unsupported model format: ${extension}`);
        }
    }

    async _loadGLTF(path) {
        return new Promise((resolve, reject) => {
            this.GLTFLoader.load(
                path,
                (gltf) => {
                    const model = gltf.scene;
                    const animations = gltf.animations || [];
                    let mixer = null;
                    const actions = {};

                    if (animations.length > 0) {
                        mixer = new THREE.AnimationMixer(model);

                        for (const clip of animations) {
                            actions[clip.name || `clip_${Object.keys(actions).length}`] =
                                mixer.clipAction(clip);
                        }

                        this.mixers.push(mixer);
                    }

                    resolve({
                        gltf,
                        model,
                        animations,
                        mixer,
                        actions,
                        playFirst: () => {
                            if (!mixer || animations.length === 0) return;
                            const action = mixer.clipAction(animations[0]);
                            action.reset();
                            action.enabled = true;
                            action.setEffectiveWeight(1);
                            action.setEffectiveTimeScale(1);
                            action.play();
                        },
                        play: (name) => {
                            if (!mixer) return;
                            const clip = animations.find((c) => c.name === name);
                            if (!clip) {
                                console.warn(`Animation not found: ${name}`);
                                return;
                            }

                            const action = mixer.clipAction(clip);
                            action.reset();
                            action.enabled = true;
                            action.setEffectiveWeight(1);
                            action.setEffectiveTimeScale(1);
                            action.play();
                        }
                    });
                },
                undefined,
                reject
            );
        });
    }

    update(delta) {
        this.mixers.forEach((mixer) => mixer.update(delta));
    }
}