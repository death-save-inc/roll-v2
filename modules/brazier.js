import * as THREE from 'three';

export const  createBrazier = async (scene, position, scale) => {
    const model = await scene.loadModel("assets/models/brazier2.glb")

    console.log(model.scene.children)
    model.scene.children[0].material = new THREE.MeshPhongMaterial({ color: new THREE.Color().setRGB(255 / 255, 255 / 255, 0 / 255) })
    model.scene.children[1].material = new THREE.MeshPhongMaterial({ color: new THREE.Color().setRGB(138 / 255, 129 / 255, 124 / 255) })

    model.scene.position.fromArray(position.toArray())
    model.scene.scale.fromArray(scale.toArray())
    scene.scene.add(model.scene)
    return model
}